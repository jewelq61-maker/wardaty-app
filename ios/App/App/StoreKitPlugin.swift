import Foundation
import Capacitor
import StoreKit

@objc(StoreKitPlugin)
public class StoreKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "StoreKitPlugin"
    public let jsName = "StoreKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getProducts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "purchase", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "restorePurchases", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSubscriptionStatus", returnType: CAPPluginReturnPromise),
    ]

    private var updateListenerTask: Task<Void, Error>?

    override public func load() {
        updateListenerTask = listenForTransactions()
    }

    deinit {
        updateListenerTask?.cancel()
    }

    // MARK: - Transaction Listener
    private func listenForTransactions() -> Task<Void, Error> {
        return Task.detached {
            for await result in Transaction.updates {
                do {
                    let transaction = try self.checkVerified(result)
                    await self.updateSubscriptionStatus(transaction: transaction)
                    await transaction.finish()
                } catch {
                    print("Transaction verification failed: \(error)")
                }
            }
        }
    }

    // MARK: - Get Products
    @objc func getProducts(_ call: CAPPluginCall) {
        guard let productIds = call.getArray("productIds", String.self) else {
            call.reject("Missing productIds parameter")
            return
        }

        Task {
            do {
                let products = try await Product.products(for: Set(productIds))
                let productsData = products.map { product -> [String: Any] in
                    var data: [String: Any] = [
                        "id": product.id,
                        "displayName": product.displayName,
                        "description": product.description,
                        "displayPrice": product.displayPrice,
                        "price": NSDecimalNumber(decimal: product.price).doubleValue,
                        "type": product.type.rawValue,
                    ]

                    if let subscription = product.subscription {
                        data["subscriptionPeriod"] = [
                            "unit": self.periodUnitString(subscription.subscriptionPeriod.unit),
                            "value": subscription.subscriptionPeriod.value,
                        ]
                        if let introOffer = subscription.introductoryOffer {
                            data["introductoryOffer"] = [
                                "displayPrice": introOffer.displayPrice,
                                "period": [
                                    "unit": self.periodUnitString(introOffer.period.unit),
                                    "value": introOffer.period.value,
                                ],
                                "paymentMode": self.paymentModeString(introOffer.paymentMode),
                            ]
                        }
                    }

                    return data
                }

                call.resolve(["products": productsData])
            } catch {
                call.reject("Failed to load products: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Purchase
    @objc func purchase(_ call: CAPPluginCall) {
        guard let productId = call.getString("productId") else {
            call.reject("Missing productId parameter")
            return
        }

        Task {
            do {
                let products = try await Product.products(for: [productId])
                guard let product = products.first else {
                    call.reject("Product not found: \(productId)")
                    return
                }

                let result = try await product.purchase()

                switch result {
                case .success(let verification):
                    let transaction = try checkVerified(verification)
                    await updateSubscriptionStatus(transaction: transaction)
                    await transaction.finish()

                    call.resolve([
                        "success": true,
                        "transactionId": String(transaction.id),
                        "productId": transaction.productID,
                        "originalId": String(transaction.originalID),
                        "expirationDate": transaction.expirationDate?.timeIntervalSince1970 ?? 0,
                    ])

                case .userCancelled:
                    call.resolve([
                        "success": false,
                        "cancelled": true,
                    ])

                case .pending:
                    call.resolve([
                        "success": false,
                        "pending": true,
                    ])

                @unknown default:
                    call.reject("Unknown purchase result")
                }
            } catch {
                call.reject("Purchase failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Restore Purchases
    @objc func restorePurchases(_ call: CAPPluginCall) {
        Task {
            do {
                try await AppStore.sync()

                var hasActiveSubscription = false
                for await result in Transaction.currentEntitlements {
                    do {
                        let transaction = try checkVerified(result)
                        if transaction.productType == .autoRenewable {
                            hasActiveSubscription = true
                            await updateSubscriptionStatus(transaction: transaction)
                        }
                    } catch {
                        continue
                    }
                }

                call.resolve([
                    "success": true,
                    "hasActiveSubscription": hasActiveSubscription,
                ])
            } catch {
                call.reject("Restore failed: \(error.localizedDescription)")
            }
        }
    }

    // MARK: - Get Subscription Status
    @objc func getSubscriptionStatus(_ call: CAPPluginCall) {
        Task {
            var activeSubscription: [String: Any]?

            for await result in Transaction.currentEntitlements {
                do {
                    let transaction = try checkVerified(result)
                    if transaction.productType == .autoRenewable {
                        activeSubscription = [
                            "productId": transaction.productID,
                            "transactionId": String(transaction.id),
                            "originalId": String(transaction.originalID),
                            "expirationDate": transaction.expirationDate?.timeIntervalSince1970 ?? 0,
                            "isActive": true,
                        ]
                    }
                } catch {
                    continue
                }
            }

            if let sub = activeSubscription {
                call.resolve([
                    "isActive": true,
                    "subscription": sub,
                ])
            } else {
                call.resolve([
                    "isActive": false,
                ])
            }
        }
    }

    // MARK: - Helpers
    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .unverified(_, let error):
            throw error
        case .verified(let safe):
            return safe
        }
    }

    private func updateSubscriptionStatus(transaction: Transaction) async {
        // Notify the web layer about subscription changes
        notifyListeners("subscriptionStatusChanged", data: [
            "productId": transaction.productID,
            "isActive": transaction.revocationDate == nil,
            "expirationDate": transaction.expirationDate?.timeIntervalSince1970 ?? 0,
        ])
    }

    private func periodUnitString(_ unit: Product.SubscriptionPeriod.Unit) -> String {
        switch unit {
        case .day: return "day"
        case .week: return "week"
        case .month: return "month"
        case .year: return "year"
        @unknown default: return "unknown"
        }
    }

    private func paymentModeString(_ mode: Product.SubscriptionOffer.PaymentMode) -> String {
        switch mode {
        case .freeTrial: return "freeTrial"
        case .payAsYouGo: return "payAsYouGo"
        case .payUpFront: return "payUpFront"
        @unknown default: return "unknown"
        }
    }
}

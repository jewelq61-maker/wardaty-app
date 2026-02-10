import Foundation
import Capacitor
import HealthKit

@objc(HealthKitPlugin)
public class HealthKitPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "HealthKitPlugin"
    public let jsName = "HealthKit"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAuthorization", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSteps", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getWeight", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getSleep", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getHeartRate", returnType: CAPPluginReturnPromise),
    ]

    private let healthStore = HKHealthStore()

    // MARK: - Check Availability
    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve([
            "available": HKHealthStore.isHealthDataAvailable()
        ])
    }

    // MARK: - Request Authorization
    @objc func requestAuthorization(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("HealthKit is not available on this device")
            return
        }

        var readTypes = Set<HKObjectType>()

        // Always request these base types
        if let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) {
            readTypes.insert(stepType)
        }
        if let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) {
            readTypes.insert(weightType)
        }
        if let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) {
            readTypes.insert(sleepType)
        }
        if let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) {
            readTypes.insert(heartRateType)
        }

        healthStore.requestAuthorization(toShare: nil, read: readTypes) { success, error in
            if let error = error {
                call.reject("Authorization failed: \(error.localizedDescription)")
                return
            }
            call.resolve([
                "authorized": success
            ])
        }
    }

    // MARK: - Get Steps
    @objc func getSteps(_ call: CAPPluginCall) {
        guard let stepType = HKQuantityType.quantityType(forIdentifier: .stepCount) else {
            call.reject("Step count type not available")
            return
        }

        let now = Date()
        let startOfDay = Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)

        let query = HKStatisticsQuery(quantityType: stepType, quantitySamplePredicate: predicate, options: .cumulativeSum) { _, result, error in
            if let error = error {
                call.reject("Failed to get steps: \(error.localizedDescription)")
                return
            }

            let steps = result?.sumQuantity()?.doubleValue(for: HKUnit.count()) ?? 0
            call.resolve([
                "value": Int(steps),
                "unit": "count",
                "date": ISO8601DateFormatter().string(from: now),
            ])
        }

        healthStore.execute(query)
    }

    // MARK: - Get Weight
    @objc func getWeight(_ call: CAPPluginCall) {
        guard let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass) else {
            call.reject("Body mass type not available")
            return
        }

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(sampleType: weightType, predicate: nil, limit: 1, sortDescriptors: [sortDescriptor]) { _, results, error in
            if let error = error {
                call.reject("Failed to get weight: \(error.localizedDescription)")
                return
            }

            guard let sample = results?.first as? HKQuantitySample else {
                call.resolve([
                    "value": 0,
                    "unit": "kg",
                    "date": "",
                    "hasData": false,
                ])
                return
            }

            let weight = sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
            call.resolve([
                "value": round(weight * 10) / 10,
                "unit": "kg",
                "date": ISO8601DateFormatter().string(from: sample.endDate),
                "hasData": true,
            ])
        }

        healthStore.execute(query)
    }

    // MARK: - Get Sleep
    @objc func getSleep(_ call: CAPPluginCall) {
        guard let sleepType = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else {
            call.reject("Sleep analysis type not available")
            return
        }

        let now = Date()
        let startOfDay = Calendar.current.date(byAdding: .day, value: -1, to: Calendar.current.startOfDay(for: now))!
        let predicate = HKQuery.predicateForSamples(withStart: startOfDay, end: now, options: .strictStartDate)
        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: [sortDescriptor]) { _, results, error in
            if let error = error {
                call.reject("Failed to get sleep: \(error.localizedDescription)")
                return
            }

            var totalSleepMinutes: Double = 0
            if let samples = results as? [HKCategorySample] {
                for sample in samples {
                    // Only count actual sleep (not inBed)
                    if sample.value != HKCategoryValueSleepAnalysis.inBed.rawValue {
                        let duration = sample.endDate.timeIntervalSince(sample.startDate)
                        totalSleepMinutes += duration / 60.0
                    }
                }
            }

            call.resolve([
                "value": Int(totalSleepMinutes),
                "unit": "minutes",
                "date": ISO8601DateFormatter().string(from: now),
                "hasData": totalSleepMinutes > 0,
            ])
        }

        healthStore.execute(query)
    }

    // MARK: - Get Heart Rate
    @objc func getHeartRate(_ call: CAPPluginCall) {
        guard let heartRateType = HKQuantityType.quantityType(forIdentifier: .heartRate) else {
            call.reject("Heart rate type not available")
            return
        }

        let sortDescriptor = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
        let query = HKSampleQuery(sampleType: heartRateType, predicate: nil, limit: 1, sortDescriptors: [sortDescriptor]) { _, results, error in
            if let error = error {
                call.reject("Failed to get heart rate: \(error.localizedDescription)")
                return
            }

            guard let sample = results?.first as? HKQuantitySample else {
                call.resolve([
                    "value": 0,
                    "unit": "bpm",
                    "date": "",
                    "hasData": false,
                ])
                return
            }

            let heartRate = sample.quantity.doubleValue(for: HKUnit(from: "count/min"))
            call.resolve([
                "value": Int(heartRate),
                "unit": "bpm",
                "date": ISO8601DateFormatter().string(from: sample.endDate),
                "hasData": true,
            ])
        }

        healthStore.execute(query)
    }
}

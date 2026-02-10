import UIKit
import Capacitor

class WardatyViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(StoreKitPlugin())
        bridge?.registerPluginInstance(HealthKitPlugin())
    }
}

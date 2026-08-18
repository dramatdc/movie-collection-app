import UIKit
import Capacitor

// capacitor.config.ts's ios.contentInset: "never" is supposed to set this,
// but the reported symptoms (a top gap roughly double a real safe-area
// inset, a native-background strip near the bottom nav) kept showing up
// across multiple rebuilds even after that config change and a confirmed
// fresh TestFlight install - pointing at the config value not reliably
// reaching the WKWebView's scroll view at runtime. Setting it directly here
// removes any dependency on that config being parsed/applied correctly.
class MainViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        webView?.scrollView.contentInsetAdjustmentBehavior = .never
    }
}

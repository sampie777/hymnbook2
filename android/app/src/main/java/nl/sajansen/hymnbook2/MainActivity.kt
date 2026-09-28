package nl.sajansen.hymnbook2

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "hymnbook2"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Pass null to prevent Android from restoring Fragment states independently
    // of React Navigation's JavaScript state tree.
    super.onCreate(null)
  }

  /**
     * When the user backs out of the root screen, move the task to the back
     * rather than finishing the Activity. This prevents the native FragmentManager
     * and OnBackPressedDispatcher from desynchronizing from the React Native JS runtime.
     */
    override fun invokeDefaultOnBackPressed() {
      moveTaskToBack(true)
    }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}

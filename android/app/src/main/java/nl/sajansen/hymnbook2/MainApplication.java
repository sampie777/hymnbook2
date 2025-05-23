package nl.sajansen.hymnbook2;

import android.annotation.SuppressLint;
import android.app.Application;
import android.provider.Settings;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;
import java.util.List;
import com.rollbar.RollbarReactNative;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }

    if (BuildConfig.DEBUG) {
        ReactNativeFlipper.initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }

    RollbarReactNative.init(this, BuildConfig.ROLLBAR_API_KEY, BuildConfig.DEBUG ? "development" : "production");
    // Set unhashed device ID (as I struggle to reach the hash function).
    // This code is copied from react-native-device-info package.
    @SuppressLint("HardwareIds") String clientId = Settings.Secure.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
    RollbarReactNative.instance().setPersonData(clientId, "", "");
  }
}

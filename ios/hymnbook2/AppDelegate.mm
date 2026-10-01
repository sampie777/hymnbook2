#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import "RNCConfig.h"
#import <RollbarReactNative/RollbarReactNative.h>
#import <RNDeviceInfo/DeviceUID.h>
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <unistd.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"hymnbook2";
  self.dependencyProvider = [RCTAppDependencyProvider new];
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // Setup Rollbar config
#if DEBUG
  NSString *rollbarEnvironment = @"development";
#else
  NSString *rollbarEnvironment = @"production";
#endif

  NSString *rollbarKey = [RNCConfig envFor:@"ROLLBAR_API_KEY"];
  NSDictionary *options = @{
    @"accessToken": rollbarKey,
    @"personId": [DeviceUID uid],
    @"environment": rollbarEnvironment
  };
  [RollbarReactNative initWithConfiguration:options];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)applicationWillTerminate:(UIApplication *)application
{
  if ([super respondsToSelector:@selector(applicationWillTerminate:)]) {
    [super applicationWillTerminate:application];
  }

  // When quitting on macOS ("Designed for iPad" on Apple Silicon Mac or Mac Catalyst), standard exit()
  // triggers __cxa_finalize_ranges (C++ static object destructors) while background React Native
  // threads (Hermes JS / Fabric) are still running, causing a SIGSEGV / EXC_BAD_ACCESS race condition.
  // _exit(0) terminates the process immediately at the kernel level without invoking static destructors.
#if TARGET_OS_MACCATALYST
  _exit(0);
#else
  if (@available(iOS 14.0, *)) {
    if ([NSProcessInfo processInfo].isiOSAppOnMac) {
      _exit(0);
    }
  }
#endif
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Used for deep linking
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

// Used for deep linking
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
 return [RCTLinkingManager application:application
                  continueUserActivity:userActivity
                    restorationHandler:restorationHandler];
}

@end

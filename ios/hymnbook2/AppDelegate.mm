#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#import "RNCConfig.h"
#import <RollbarReactNative/RollbarReactNative.h>
#import <RNDeviceInfo/DeviceUID.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"hymnbook2";
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

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
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

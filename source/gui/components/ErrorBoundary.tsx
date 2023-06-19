import React, { Component } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { rollbar } from "../../logic/rollbar";
import { defaultFontFamilies, lightColors } from "../../logic/theme";

interface ComponentProps {
  children: React.ReactNode;
}

interface ComponentState {
  error: Error | null,
  errorInfo: React.ErrorInfo | null,
  showDebugInfo: boolean,
  catchTimes: number,
}

export default class ErrorBoundary extends Component<ComponentProps, ComponentState> {

  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null,
      showDebugInfo: false,
      catchTimes: 0
    };

    this.reset = this.reset.bind(this);
    this.toggleDebugInfo = this.toggleDebugInfo.bind(this);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    rollbar.critical(error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
      catchTimes: this.state.catchTimes + 1
    });
  }

  reset() {
    this.setState({
      error: null,
      errorInfo: null,
      showDebugInfo: false,
    });
  }

  toggleDebugInfo() {
    this.setState({
      showDebugInfo: !this.state.showDebugInfo
    });
  }

  renderCodeLine({ item, index }: { item: string, index: number }) {
    return (
      <View style={styles.line} key={index}>
        <Text style={styles.lineIndex}>{index + 1}</Text>
        <Text style={styles.lineText}>{item}</Text>
      </View>
    );
  }

  render() {
    if (!this.state.errorInfo) {
      return this.props.children;
    }

    return <View style={styles.container}>
      <Text style={styles.header}>Whoops</Text>
      <Text style={styles.paragraph}>Something decided to stop working...</Text>
      <Text style={styles.paragraph}>And we're really sorry about that.</Text>

      <View style={styles.resetButtonContainer}>
        <View onTouchStart={this.reset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Try again</Text>
        </View>
        {this.state.catchTimes < 2 ? null :
          <Text style={styles.catchTimesText}>For the {this.state.catchTimes} time</Text>}
      </View>

      {!this.state.showDebugInfo
        ? <View onTouchStart={this.toggleDebugInfo} style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Show more information</Text>
        </View>
        : <View style={styles.details}>
          <Text style={styles.errorName}>{this.state.error && this.state.error.toString()}</Text>

          <FlatList
            data={this.state.errorInfo.componentStack
              .trim()
              .split("\n")}
            renderItem={this.renderCodeLine}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.code} />
        </View>
      }
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#ffffff",
    flexDirection: "column"
  },
  header: {
    fontSize: 50,
    paddingVertical: 40,
    textAlign: "center",
    fontFamily: defaultFontFamilies.sansSerifThin,
    color: lightColors.text
  },
  subheader: {
    fontSize: 25,
    marginBottom: 10,
    paddingHorizontal: 10,
    textAlign: "center",
    alignSelf: "center"
  },
  paragraph: {
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    textAlign: "center",
    color: lightColors.text
  },

  resetButtonContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 30
  },
  resetButton: {
    backgroundColor: lightColors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 10
  },
  resetButtonText: {
    color: lightColors.onPrimary,
    fontSize: 20,
    textAlign: "center"
  },
  catchTimesText: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#0006"
  },

  debugButton: {
    paddingVertical: 30
  },
  debugButtonText: {
    textAlign: "center",
    fontSize: 14,
    color: lightColors.text
  },

  details: {
    flex: 2
  },
  errorName: {
    color: "firebrick",
    fontSize: 20,
    fontFamily: defaultFontFamilies.sansSerifLight,
    marginBottom: 20,
    paddingHorizontal: 30
  },
  code: {
    paddingTop: 5,
    paddingBottom: 80,
    paddingHorizontal: 10,
    backgroundColor: "#555"
  },
  line: {
    flexDirection: "row"
  },
  lineIndex: {
    width: 30,
    color: "dodgerblue",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    marginRight: 10
  },
  lineText: {
    color: "#eee",
    fontFamily: defaultFontFamilies.sansSerifLight
  }
});

import React, { Component } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { rollbar } from "../scripts/rollbar";

interface ComponentProps {
}

interface ComponentState {
  error: Error | null,
  errorInfo: React.ErrorInfo | null,
}

export default class ErrorBoundary extends Component<ComponentProps, ComponentState> {

  constructor(props: ComponentProps) {
    super(props);

    this.state = {
      error: null,
      errorInfo: null
    };

    this.reset = this.reset.bind(this);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    rollbar.critical(error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  reset() {
    this.setState({
      error: null,
      errorInfo: null
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
      <Text style={styles.deathFace}>X _ x</Text>
      <Text style={styles.header}>Whoops, something went wrong</Text>

      <View style={styles.details}>
        <Text style={styles.errorName}>{this.state.error && this.state.error.toString()}</Text>

        <FlatList
          data={this.state.errorInfo.componentStack
            .trim()
            .split("\n")}
          renderItem={this.renderCodeLine}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.code} />
      </View>
    </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
  },
  deathFace: {
    fontSize: 50,
    paddingVertical: 40,
    textAlign: "center",
    fontFamily: "sans-serif-thin"
  },
  header: {
    fontSize: 30,
    marginBottom: 50,
    paddingHorizontal: 30,
    alignSelf: "center"
  },
  details: {
    flex: 1
  },
  errorName: {
    fontSize: 20,
    fontFamily: "sans-serif-light",
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
    fontFamily: "sans-serif-light",
  }
});

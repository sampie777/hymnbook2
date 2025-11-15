import React from "react";
import { Alert, Platform, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Settings from "../../../settings";
import { openLink } from "../../../logic/utils/utils.ts";
import { rollbar } from "../../../logic/rollbar";
import { parseDocument } from "htmlparser2";
import { mergeStyleSheets } from "../utils";
import { ElementType } from "domelementtype";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import { ChildNode, DataNode, Document, Element, Node, } from 'domhandler';
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

interface HtmlStyles {
  defaultText?: StyleProp<TextStyle>,
  p?: StyleProp<TextStyle>,
  h1?: StyleProp<TextStyle>,
  h2?: StyleProp<TextStyle>,
  h3?: StyleProp<TextStyle>,
  h4?: StyleProp<TextStyle>,
  h5?: StyleProp<TextStyle>,
  h6?: StyleProp<TextStyle>,
  ul?: StyleProp<ViewStyle>,
  ol?: StyleProp<ViewStyle>,
  li?: StyleProp<ViewStyle>,
  liIndexText?: StyleProp<TextStyle>,
  liText?: StyleProp<TextStyle>,
  pre?: StyleProp<TextStyle>,
  blockquote?: StyleProp<TextStyle>,
  code?: StyleProp<TextStyle>,
  ins?: StyleProp<TextStyle>,
  del?: StyleProp<TextStyle>,
  sup?: StyleProp<TextStyle>,
  sub?: StyleProp<TextStyle>,
  hr?: StyleProp<TextStyle>,
  strong?: StyleProp<TextStyle>,
  em?: StyleProp<TextStyle>,
  u?: StyleProp<TextStyle>,
  strike?: StyleProp<TextStyle>,
  div?: StyleProp<ViewStyle>,
  br?: StyleProp<TextStyle>,
  a?: StyleProp<TextStyle>,
}

interface Props {
  html: string;
  styles?: HtmlStyles | HtmlStyles[];
  scale: SharedValue<number>;
  onLayout?: () => void;
}

const AnimatedHtmlView: React.FC<Props> = ({ html, styles = [], scale, onLayout }) => {
  const sanitizedHtml = html
    .replace(/\n/g, "")
    .replace(/ +/g, " ")
    .replace(/(<(p|span|strong|em|u|i|s|strike|b|\/li)[^>]*>) +/g, "$1");  // Remove whitespaces after opening tags

  if (sanitizedHtml.trim().length == 0) return null;

  const defaultHtmlStyles = createDefaultHtmlStyles(useTheme());
  const animatedHtmlStyles = {
    p: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.p.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.p.lineHeight
    })),
    h1: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h1.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h1.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h1.paddingTop,
      marginBottom: scale.value * defaultHtmlStyles.h1.marginBottom
    })),
    h2: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h2.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h2.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h2.paddingTop,
      marginBottom: scale.value * defaultHtmlStyles.h2.marginBottom
    })),
    h3: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h3.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h3.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h3.paddingTop,
      marginBottom: scale.value * defaultHtmlStyles.h3.marginBottom
    })),
    h4: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h4.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h4.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h4.paddingTop,
      marginBottom: scale.value * defaultHtmlStyles.h4.marginBottom
    })),
    h5: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h5.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h5.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h5.paddingTop,
      marginBottom: scale.value * defaultHtmlStyles.h5.marginBottom
    })),
    h6: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.h6.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.h6.lineHeight,
      paddingTop: scale.value * defaultHtmlStyles.h6.paddingTop
    })),
    ul: useAnimatedStyle(() =>({
      marginVertical: scale.value * defaultHtmlStyles.ul.marginVertical
    })),
    ol: useAnimatedStyle(() =>({
      marginVertical: scale.value * defaultHtmlStyles.ol.marginVertical
    })),
    liText: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.liText.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.liText.lineHeight
    })),
    pre: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.pre.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.pre.lineHeight
    })),
    blockquote: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.blockquote.fontSize,
      lineHeight: scale.value * defaultHtmlStyles.blockquote.lineHeight,
      paddingVertical: scale.value * defaultHtmlStyles.blockquote.paddingVertical,
      marginVertical: scale.value * defaultHtmlStyles.blockquote.marginVertical
    })),
    code: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.code.fontSize
    })),
    sup: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.sup.fontSize,
      top: scale.value * defaultHtmlStyles.sup.top
    })),
    sub: useAnimatedStyle(() =>({
      fontSize: scale.value * defaultHtmlStyles.sub.fontSize
    }))
  };
  const mergedStyles: HtmlStyles = mergeStyleSheets([defaultHtmlStyles, animatedHtmlStyles, styles]);
  const document = parseDocument(sanitizedHtml) as Document;
  const ignoreTags = ["head", "script", "meta"];

  const renderTextNode = (node: DataNode, index: number, args?: any) =>
    <Animated.Text key={index}
                   importantForAccessibility={node.data != null && node.data.length > 0 ? undefined : "no"}
                   style={[mergedStyles.defaultText, args?.["style"]]}
                   dataDetectorType={"link"}
                   selectable={Settings.enableTextSelection}>
      {node.data}
    </Animated.Text>;

  const renderElementDiv = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} style={mergedStyles.div}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, args))}
    </Animated.View>;

  const renderElementText = (element: Element, index: number, args?: any, style?: StyleProp<TextStyle>) =>
    <Animated.Text key={index}
                   style={style}
                   dataDetectorType={"link"}
                   selectable={Settings.enableTextSelection}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, args))}
    </Animated.Text>;

  const renderElementSup = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} collapsable={false}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, { ...args, style: mergedStyles.sup }))}
    </Animated.View>;

  const renderElementOl = (element: Element, index: number, args?: any) => {
    const listIndex = { value: 0 };
    return <Animated.View key={index} style={mergedStyles.ol}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, {
        ...args,
        listStyleType: "ol",
        listIndex: listIndex
      }))}
    </Animated.View>;
  };

  const renderElementUl = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} style={mergedStyles.ul}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, { ...args, listStyleType: "ul" }))}
    </Animated.View>;

  const renderElementLi = (element: Element, index: number, args?: any) => {
    if (args?.listIndex) args.listIndex.value++;

    const listIndex = args?.listStyleType == "ol" ? `${args?.listIndex.value}.` : "●";
    return <Animated.View key={index} style={mergedStyles.li}>
      <Animated.Text style={[mergedStyles.liText, mergedStyles.liIndexText]}
                     selectable={Settings.enableTextSelection}>
        {listIndex}
      </Animated.Text>
      <Animated.Text style={mergedStyles.liText}
                     dataDetectorType={"link"}
                     selectable={Settings.enableTextSelection}>
        {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, args))}
      </Animated.Text>
    </Animated.View>;
  };

  const renderElementBr = (element: Element, index: number, args?: any) =>
    <Animated.Text key={index}
                   style={mergedStyles.br}
                   selectable={Settings.enableTextSelection}>
      {"\n"}
    </Animated.Text>;

  const renderElementA = (element: Element, index: number, args?: any) => {
    const onPress = () => openLink(element.attribs.href)
      .catch(e => Alert.alert("Error opening link", e.message));
    return <Animated.Text key={index}
                          onPress={onPress}
                          style={mergedStyles.a}
                          selectable={Settings.enableTextSelection}>
      {(element.children as ChildNode[]).map((it, i) => renderNode(it, i, args))}
    </Animated.Text>;
  };

  const renderElement = (element: Element, index: number, args?: any) => {
    if (ignoreTags.includes(element.name)) return null;

    if (element.name == "i") element.name = "em";
    if (element.name == "b") element.name = "strong";
    if (element.name == "s") element.name = "strike";

    switch (element.name) {
      case "p":
      case "strong":
      case "em":
      case "u":
      case "strike":
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "sub":
        return renderElementText(element, index, args, mergedStyles[element.name as keyof HtmlStyles]);
      case "span":
        return renderElementText(element, index, args);
      case "sup":
        return renderElementSup(element, index, args);
      case "ol":
        return renderElementOl(element, index, args);
      case "ul":
        return renderElementUl(element, index, args);
      case "li":
        return renderElementLi(element, index, args);
      case "br":
        return renderElementBr(element, index, args);
      case "a":
        return renderElementA(element, index, args);
      default:
        return renderElementDiv(element, index, args);
    }
  };

  const renderNode = (node: Node, index: number, args?: any) => {
    switch (node.type) {
      case ElementType.Text:
        return renderTextNode(node as DataNode, index, args);
      case ElementType.Tag:
        return renderElement(node as Element, index, args);
      default:
        rollbar.warning("No render implemented for node type", {
          nodeType: node.type,
          node: node,
          parentNode: node.parent
        });
    }
    return undefined;
  };

  // Use some value to keep track of changing HTML content, so we can tell
  // React a rerender is necessary. The 'index'-keys on the child elements don't
  // do a very good job with this.
  return <View key={html.length} onLayout={onLayout}>
    {(document.children as ChildNode[]).map((it, index) => renderNode(it, index))}
  </View>;
};

export const createDefaultHtmlStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  defaultText: {
    color: colors.text.default
  },
  p: {
    color: colors.text.default,
    fontSize: 20,
    lineHeight: 30
  },
  h1: {
    color: colors.text.default,
    fontSize: 38,
    lineHeight: 50,
    paddingTop: 10,
    marginBottom: 20,
    fontWeight: "bold"
  },
  h2: {
    color: colors.text.default,
    fontSize: 32,
    lineHeight: 50,
    paddingTop: 25,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h3: {
    color: colors.text.default,
    fontSize: 22,
    lineHeight: 40,
    paddingTop: 30,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h4: {
    color: colors.text.default,
    fontSize: 20,
    lineHeight: 35,
    paddingTop: 25,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h5: {
    color: colors.text.default,
    fontSize: 18,
    lineHeight: 30,
    paddingTop: 15,
    marginBottom: 20,
    fontWeight: "bold"
  },
  h6: {
    color: colors.text.default,
    fontSize: 16,
    lineHeight: 25,
    paddingTop: 10,
    fontWeight: "bold"
  },
  ul: {
    marginVertical: 20
  },
  ol: {
    marginVertical: 20
  },
  li: {
    flexDirection: "row"
  },
  liIndexText: {
    paddingLeft: 0,
    paddingRight: 10,
    flex: 0,
    textAlign: "right"
  },
  liText: {
    color: colors.text.default,
    fontSize: 20,
    lineHeight: 30,
    flex: 1
  },
  pre: {
    color: colors.text.default,
    fontSize: 19,
    lineHeight: 30,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  blockquote: {
    color: colors.text.default,
    fontSize: 20,
    lineHeight: 30,
    borderLeftWidth: 5,
    borderLeftColor: colors.border.variant,
    paddingLeft: 30,
    paddingVertical: 15,
    marginVertical: 15
  },
  code: {
    fontSize: 19,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  ins: {
    color: colors.text.default,
    textDecorationLine: "underline"
  },
  del: {
    color: colors.text.default,
    textDecorationLine: "line-through"
  },
  sup: {
    color: colors.text.default,
    fontSize: 13,
    top: -5
  },
  sub: {
    color: colors.text.default,
    fontSize: 13
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#555"
  },
  strong: {
    color: colors.text.default,
    fontWeight: "bold"
  },
  em: {
    color: colors.text.default,
    fontStyle: "italic"
  },
  u: {
    color: colors.text.default,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: colors.text.default
  },
  strike: {
    color: colors.text.default,
    textDecorationLine: "line-through",
    textDecorationStyle: "solid",
    textDecorationColor: colors.text.default
  },
  div: {},
  br: {},
  a: {
    color: colors.url
  }
});

export default AnimatedHtmlView;

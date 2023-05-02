import React from "react";
import {
  Alert,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle
} from "react-native";
import { parseDocument } from "htmlparser2";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import { DataNode, Document, Element, Node } from "domhandler/lib/node";
import { ElementType } from "domelementtype";
import { mergeStyleSheets } from "../utils";
import Animated, { AnimateStyle } from "react-native-reanimated";
import { openLink } from "../../../logic/utils";

interface HtmlStyles {
  p?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h1?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h2?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h3?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h4?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h5?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  h6?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  ul?: StyleProp<AnimateStyle<StyleProp<ViewStyle>>>,
  ol?: StyleProp<AnimateStyle<StyleProp<ViewStyle>>>,
  li?: StyleProp<AnimateStyle<StyleProp<ViewStyle>>>,
  liIndexText?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  liText?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  pre?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  blockquote?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  code?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  ins?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  del?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  sup?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  sub?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  hr?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  strong?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  em?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  u?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  div?: StyleProp<AnimateStyle<StyleProp<ViewStyle>>>,
  br?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
  a?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>,
}

interface Props {
  html: string;
  styles?: HtmlStyles | HtmlStyles[];
  scale: Animated.Value<number>;
}

const AnimatedHtmlView: React.FC<Props> = ({ html, styles = [], scale }) => {
  const start = new Date();
  const sanitizedHtml = html
    .replace(/\n/g, "")
    .replace(/ +/g, " ")
    .replace(/(<(p|span|strong|em|u|\/li)[^>]*>) +/g, "$1");  // Remove whitespaces after opening tags

  if (html.trim().length == 0) return null;

  const defaultHtmlStyles = createDefaultHtmlStyles(useTheme());
  const animatedHtmlStyles = {
    p: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.p.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.p.lineHeight)
    },
    h1: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h1.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h1.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h1.paddingTop),
      marginBottom: Animated.multiply(scale, defaultHtmlStyles.h1.marginBottom)
    },
    h2: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h2.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h2.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h2.paddingTop),
      marginBottom: Animated.multiply(scale, defaultHtmlStyles.h2.marginBottom)
    },
    h3: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h3.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h3.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h3.paddingTop),
      marginBottom: Animated.multiply(scale, defaultHtmlStyles.h3.marginBottom)
    },
    h4: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h4.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h4.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h4.paddingTop),
      marginBottom: Animated.multiply(scale, defaultHtmlStyles.h4.marginBottom)
    },
    h5: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h5.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h5.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h5.paddingTop),
      marginBottom: Animated.multiply(scale, defaultHtmlStyles.h5.marginBottom)
    },
    h6: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.h6.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.h6.lineHeight),
      paddingTop: Animated.multiply(scale, defaultHtmlStyles.h6.paddingTop)
    },
    ul: {
      marginVertical: Animated.multiply(scale, defaultHtmlStyles.ul.marginVertical)
    },
    ol: {
      marginVertical: Animated.multiply(scale, defaultHtmlStyles.ol.marginVertical)
    },
    liText: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.liText.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.liText.lineHeight)
    },
    pre: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.pre.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.pre.lineHeight)
    },
    blockquote: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.blockquote.fontSize),
      lineHeight: Animated.multiply(scale, defaultHtmlStyles.blockquote.lineHeight),
      paddingVertical: Animated.multiply(scale, defaultHtmlStyles.blockquote.paddingVertical),
      marginVertical: Animated.multiply(scale, defaultHtmlStyles.blockquote.marginVertical)
    },
    code: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.code.fontSize)
    },
    sup: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.sup.fontSize)
    },
    sub: {
      fontSize: Animated.multiply(scale, defaultHtmlStyles.sub.fontSize)
    }
  };
  const mergedStyles: HtmlStyles = mergeStyleSheets([defaultHtmlStyles, animatedHtmlStyles, styles]);
  const document = parseDocument(sanitizedHtml) as Document;
  const ignoreTags = ["head", "script", "meta"];

  const renderTextNode = (node: DataNode, index: number, args?: any) =>
    <Animated.Text key={index} style={args?.["style"]}>{node.data}</Animated.Text>;

  const renderElementDiv = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} style={mergedStyles.div}>
      {element.children.map((it, i) => renderNode(it, i, args))}
    </Animated.View>;

  const renderElementText = (element: Element, index: number, args?: any, style?: StyleProp<AnimateStyle<StyleProp<TextStyle>>>) =>
    <Animated.Text key={index} style={style}>
      {element.children.map((it, i) => renderNode(it, i, args))}
    </Animated.Text>;

  const renderElementSup = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} collapsable={false}>
      {element.children.map((it, i) => renderNode(it, i, { ...args, style: mergedStyles.sup }))}
    </Animated.View>;

  const renderElementOl = (element: Element, index: number, args?: any) => {
    const listIndex = { value: 0 };
    return <Animated.View key={index} style={mergedStyles.ol}>
      {element.children.map((it, i) => renderNode(it, i, { ...args, listStyleType: "ol", listIndex: listIndex }))}
    </Animated.View>;
  };

  const renderElementUl = (element: Element, index: number, args?: any) =>
    <Animated.View key={index} style={mergedStyles.ul}>
      {element.children.map((it, i) => renderNode(it, i, { ...args, listStyleType: "ul" }))}
    </Animated.View>;

  const renderElementLi = (element: Element, index: number, args?: any) => {
    if (args?.listIndex) args.listIndex.value++;

    const listIndex = args?.listStyleType == "ol" ? `${args?.listIndex.value}.` : "●";
    return <Animated.View key={index} style={mergedStyles.li}>
      <Animated.Text style={[mergedStyles.liText, mergedStyles.liIndexText]}>{listIndex}</Animated.Text>
      {element.children.map((it, i) => renderNode(it, i, { ...args, style: mergedStyles.liText }))}
    </Animated.View>;
  };

  const renderElementBr = (element: Element, index: number, args?: any) =>
    <Animated.Text key={index} style={mergedStyles.br}>{"\n"}</Animated.Text>;

  const renderElementA = (element: Element, index: number, args?: any) => {
    const onPress = () => openLink(element.attribs.href)
      .catch(e => Alert.alert("Error opening link", e.message));
    return <Animated.Text key={index} onPress={onPress} style={mergedStyles.a}>
      {element.children.map((it, i) => renderNode(it, i, args))}
    </Animated.Text>;
  };

  const renderElement = (element: Element, index: number, args?: any) => {
    if (ignoreTags.includes(element.name)) return null;

    switch (element.name) {
      case "p":
      case "strong":
      case "em":
      case "u":
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
      case "sub":
        return renderElementText(element, index, args, mergedStyles[element.name]);
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
        console.warn("No render implemented for node type", node.type);
    }
    return undefined;
  };

  // Use some value to keep track of changing HTML content, so we can tell
  // React a rerender is necessary. The 'index'-keys on the child elements don't
  // do a very good job with this.
  return <View key={html.length} onLayout={() => console.log((new Date()).getTime() - start.getTime())}>
    {document.children.map((it, index) => renderNode(it, index))}
  </View>;
};

export const createDefaultHtmlStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  p: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 30
  },
  h1: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 50,
    paddingTop: 10,
    marginBottom: 20,
    fontWeight: "bold"
  },
  h2: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 50,
    paddingTop: 25,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h3: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 40,
    paddingTop: 30,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h4: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 35,
    paddingTop: 25,
    marginBottom: 10,
    fontWeight: "bold"
  },
  h5: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 30,
    paddingTop: 15,
    marginBottom: 20,
    fontWeight: "bold"
  },
  h6: {
    color: colors.text,
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
    color: colors.text,
    fontSize: 20,
    lineHeight: 30,
    flex: 1
  },
  pre: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 30,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  blockquote: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 30,
    borderLeftWidth: 5,
    borderLeftColor: colors.borderVariant,
    paddingLeft: 30,
    paddingVertical: 15,
    marginVertical: 15
  },
  code: {
    fontSize: 19,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  ins: {
    color: colors.text,
    textDecorationLine: "underline"
  },
  del: {
    color: colors.text,
    textDecorationLine: "line-through"
  },
  sup: {
    color: colors.text,
    fontSize: 13
  },
  sub: {
    color: colors.text,
    fontSize: 13
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#555"
  },
  strong: {
    color: colors.text,
    fontWeight: "bold"
  },
  em: {
    color: colors.text,
    fontStyle: "italic"
  },
  u: {
    color: colors.text,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: colors.text
  },
  div: {},
  br: {
    borderWidth: 1
  },
  a: {
    color: colors.url
  }
});

export default AnimatedHtmlView;

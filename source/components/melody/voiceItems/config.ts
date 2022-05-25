export const AbcConfig = {
  baseScale: 0.75,

  topSpacing: 20,
  lineSpacing: 8,
  textSpacing: 13,

  lineWidth: 1,
  lineBarThinWidth: 1.5,
  lineBarThickWidth: 8,

  notePadding: 13,
  noteWidth: 4.8,
  noteHeight: 2.8,
  stemHeight: 28,
  stemWidth: 2,
  accidentalWidth: 8,
  spacerWidth: 7,

  textPadding: 3,
  textSize: 20,
  textLineHeight: 40,

  totalLineHeight: 0,
  introEmptyGapWidth: 10
};

AbcConfig.totalLineHeight = AbcConfig.topSpacing + 4 * AbcConfig.lineSpacing + AbcConfig.textSpacing;

const { origin, private, blockType, back } = require('./keyboard_btns');

module.exports = {
  origin: [
    [origin.private, origin.blockType],
    [origin.all]
  ],
  private: [
    [private.on, private.off],
    [back]
  ],
  blockType: [
    [blockType.ma_l, blockType.ma_m, blockType.ma_s],
    [back]
  ],
  all: [
    [back]
  ]
}
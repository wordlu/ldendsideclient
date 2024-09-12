/**
 * 包含了一些常用的函数.
 */

// 判断本地的大小端
export const isBigEndian = (() => {
  const array = new Uint8Array(4)
  const view = new Uint32Array(array.buffer)
  return !((view[0] = 1) & array[0])
})()

export function getBufferVal(
  buf: Buffer,
  startIdx: number,
  fieldType: 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32' | 'f32' | 'i64' | 'u64' | 'f64',
  isBigendian: boolean
): number | bigint {
  if (isBigendian) {
    switch (fieldType) {
      case 'u8':
        return buf.readUint8(startIdx)
      case 'i8':
        return buf.readInt8(startIdx)
      case 'u16':
        return buf.readUint16BE(startIdx)
      case 'i16':
        return buf.readInt16BE(startIdx)
      case 'u32':
        return buf.readUint32BE(startIdx)
      case 'i32':
        return buf.readInt32BE(startIdx)
      case 'f32':
        return buf.readFloatBE(startIdx)
      case 'i64':
        return buf.readBigInt64BE(startIdx)
      case 'u64':
        return buf.readBigUint64BE(startIdx)
      case 'f64':
        return buf.readDoubleBE(startIdx)
      default:
        throw Error(`Unknown field type. type: ${fieldType}`)
    }
  } else {
    switch (fieldType) {
      case 'u8':
        return buf.readUint8(startIdx)
      case 'i8':
        return buf.readInt8(startIdx)
      case 'u16':
        return buf.readUint16LE(startIdx)
      case 'i16':
        return buf.readInt16LE(startIdx)
      case 'u32':
        return buf.readUint32LE(startIdx)
      case 'i32':
        return buf.readInt32LE(startIdx)
      case 'f32':
        return buf.readFloatLE(startIdx)
      case 'i64':
        return buf.readBigInt64LE(startIdx)
      case 'u64':
        return buf.readBigUint64LE(startIdx)
      case 'f64':
        return buf.readDoubleLE(startIdx)
      default:
        throw Error(`Unknown field type. type: ${fieldType}`)
    }
  }
}

export function getTypedArray(
  arrBuf: ArrayBuffer,
  fieldType: 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32' | 'f32' | 'i64' | 'u64' | 'f64'
) {
  switch (fieldType) {
    case 'u8':
      return new Uint8Array(arrBuf)
    case 'i8':
      return new Int8Array(arrBuf)
    case 'u16':
      return new Uint16Array(arrBuf)
    case 'i16':
      return new Int16Array(arrBuf)
    case 'u32':
      return new Uint32Array(arrBuf)
    case 'i32':
      return new Int32Array(arrBuf)
    case 'f32':
      return new Float32Array(arrBuf)
    case 'i64':
      return new BigInt64Array(arrBuf)
    case 'u64':
      return new BigUint64Array(arrBuf)
    case 'f64':
      return new Float64Array(arrBuf)
    default:
      throw Error(`Unknown field type. type: ${fieldType}`)
  }
}

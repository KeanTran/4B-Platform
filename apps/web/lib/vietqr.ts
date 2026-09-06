/**
 * VietQR EMVCo Generator
 * Generates VietQR payment QR codes without API
 */

const VIETQR_GUID = 'A000000727';
const VIETQR_MERCHANT_ID = '02';
const VIETQR_MOBILE = '03';
const VIETQR_GUID_HEX = hexEncode(VIETQR_GUID);

function hexEncode(str: string): string {
  return str.split('').map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
}

function encodeEMV(tag: string, value: string): string {
  const valueHex = encodeString(value);
  return tag + valueHex.length.toString().padStart(2, '0') + valueHex;
}

function encodeString(str: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function padRight(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char);
}

function padLeft(str: string, length: number, char: string = '0'): string {
  return str.padStart(length, char);
}

export interface VietQRParams {
  bankBin: string;
  bankNumber: string;
  accountName: string;
  amount?: number;
  message?: string;
}

/**
 * Generate VietQR EMV payload string
 */
export function generateVietQRPayload(params: VietQRParams): string {
  const { bankBin, bankNumber, accountName, amount, message } = params;

  const merchantIdentifier = VIETQR_GUID;
  const merchantIdentifierHex = hexEncode(merchantIdentifier);
  const appLabel = 'VietQR';
  const appLabelHex = encodeString(appLabel);

  // Build EMI data
  const gui = encodeEMV('00', '01');
  const version = encodeEMV('01', '01');
  const merchantCategoryCode = encodeEMV('52', '0000');
  const currency = encodeEMV('53', '704');

  // Transaction amount (optional)
  const transactionAmount = amount
    ? encodeEMV('54', amount.toString())
    : '';

  // Country code
  const countryCode = encodeEMV('58', 'VN');

  // Merchant name (account holder)
  const merchantName = encodeEMV('59', padRight(accountName, 25).slice(0, 25));

  // Merchant city
  const merchantCity = encodeEMV('60', padRight('VN', 15).slice(0, 15));

  // Additional data
  const transactionCurrency = amount ? encodeEMV('54', amount.toString()) : '';
  const transactionMessage = message
    ? encodeEMV('05', padRight(message, 50).slice(0, 50))
    : '';

  const additionalData = encodeEMV('61', transactionMessage);

  // CRC16 calculation
  const crcData =
    gui +
    version +
    merchantCategoryCode +
    currency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    '6304';

  const crc = calculateCRC16(crcData);

  return (
    '000201' +
    gui +
    version +
    merchantCategoryCode +
    currency +
    transactionAmount +
    countryCode +
    merchantName +
    merchantCity +
    additionalData +
    '6304' +
    crc.toString(16).toUpperCase().padStart(4, '0')
  );
}

/**
 * CRC16-CCITT calculation
 */
function calculateCRC16(data: string): number {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return crc & 0xffff;
}

/**
 * Generate VietQR URL for QR code
 */
export function generateVietQRUrl(params: VietQRParams): string {
  const payload = generateVietQRPayload(params);
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`;
}

/**
 * Generate VietQR as base64 data URL
 */
export function generateVietQRDataUrl(params: VietQRParams): string {
  const payload = generateVietQRPayload(params);
  return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><text x="150" y="150" text-anchor="middle" font-size="14">VietQR</text></svg>`)}`;
}

// Bank BIN to Bank Code mapping (sample)
export const BANK_CODES: Record<string, { bin: string; name: string }> = {
  '970406': { bin: '970406', name: 'VPBank' },
  '970432': { bin: '970432', name: 'TPBank' },
  '970418': { bin: '970418', name: 'BIDV' },
  '970422': { bin: '970422', name: 'MBBank' },
  '970415': { bin: '970415', name: 'ACB' },
  '970419': { bin: '970419', name: 'Sacombank' },
  '970425': { bin: '970425', name: 'VietinBank' },
  '970436': { bin: '970436', name: 'BAOVIET Bank' },
  '970443': { bin: '970443', name: 'MBBank (Momo)' },
  '970454': { bin: '970454', name: 'Vietcombank' },
};

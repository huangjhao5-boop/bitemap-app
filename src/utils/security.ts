/**
 * BiteMap 安全密碼學工具 (Web Crypto API 原生零依賴)
 * 用於 PIN 碼的單向 SHA-256 雜湊與比對，拒絕明文傳輸與伺服器明文儲存
 */

export async function hashPinCode(pin: string): Promise<string> {
  const clean = (pin || '8888').trim();
  if (!window?.crypto?.subtle) {
    // 極端降級備援（如極舊不支援 Web Crypto 之環境）
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      const char = clean.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `fallback_${Math.abs(hash)}`;
  }

  const encoder = new TextEncoder();
  // 加上專屬鹽值防止彩虹表反查
  const data = encoder.encode(`bitemap_salt_${clean}_v1`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPinCode(inputPin: string, storedHashOrPlain: string): Promise<boolean> {
  const cleanInput = (inputPin || '').trim();
  const target = (storedHashOrPlain || '').trim();

  // 若資料庫內存的是舊版明文 PIN（如 '8888' 或 4-6 碼純數字）
  if (target.length <= 8) {
    return cleanInput === target;
  }

  // 若資料庫內已升級為 SHA-256 雜湊
  const computedHash = await hashPinCode(cleanInput);
  return computedHash === target;
}

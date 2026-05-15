import java.io.FileInputStream;
import java.security.Key;
import java.security.KeyStore;
import java.util.Base64;

/**
 * Extracts a SecretKeyEntry from a PKCS#12 keystore and prints the raw key bytes as Base64.
 *
 * Usage:
 *   javac scripts/ExtractEkycAesKeyFromP12.java
 *   java -cp scripts ExtractEkycAesKeyFromP12 \
 *     assets/certificates/sit_consumer-to-esb_aeskey.p12 esbdcmssit sit_consumer-to-esb_aeskey esbdcmssit
 *
 * Then set:
 *   EXPO_PUBLIC_EKYC_AES_KEY_BASE64=<printed value>
 */
public class ExtractEkycAesKeyFromP12 {
  public static void main(String[] args) throws Exception {
    if (args.length < 4) {
      System.err.println(
          "Args: <pkcs12Path> <pkcs12Password> <alias> <keyPassword>\n" +
          "Example: assets/certificates/sit_consumer-to-esb_aeskey.p12 esbdcmssit sit_consumer-to-esb_aeskey esbdcmssit");
      System.exit(2);
    }

    String pkcs12Path = args[0];
    char[] storePass = args[1].toCharArray();
    String alias = args[2];
    char[] keyPass = args[3].toCharArray();

    KeyStore keyStore = KeyStore.getInstance("PKCS12");
    try (FileInputStream fis = new FileInputStream(pkcs12Path)) {
      keyStore.load(fis, storePass);
    }

    Key key = keyStore.getKey(alias, keyPass);
    if (key == null) throw new RuntimeException("No key found for alias: " + alias);

    byte[] raw = key.getEncoded();
    if (raw == null || raw.length == 0) {
      throw new RuntimeException("Key did not return encodable bytes for alias: " + alias);
    }

    System.out.println(Base64.getEncoder().encodeToString(raw));
  }
}


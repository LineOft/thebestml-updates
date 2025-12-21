# TheBestML Installer - Güncelleme Sunucusu

Bu repo, TheBestML Installer uygulamasının OTA (Over-The-Air) güncellemeleri için kullanılır.

## 📁 Dosya Yapısı

- `manifest.json` - Sürüm bilgileri ve değişiklik notları
- `config.json` - Uygulama yapılandırması (key, APK URL vs.)

## 🔄 Güncelleme Nasıl Yapılır?

### 1. Key Değiştirmek İçin
`config.json` dosyasındaki `key` değerini değiştirin:
```json
{
    "key": "YENIKEY2025"
}
```

### 2. APK Linki Değiştirmek İçin
`config.json` dosyasındaki `apkUrl` değerini değiştirin.

### 3. Yeni Sürüm Yayınlamak İçin
`manifest.json` dosyasını güncelleyin:
```json
{
    "version": "1.3.1",
    "buildNumber": 4,
    "changelog": [
        "Yeni özellik 1",
        "Bug düzeltmesi"
    ]
}
```

**ÖNEMLİ:** `buildNumber` değerini her güncellemede 1 artırın!

## 📱 Uygulama Nasıl Çalışır?

1. Uygulama açıldığında GitHub'dan `manifest.json` çeker
2. Yerel `buildNumber` ile karşılaştırır
3. Yeni sürüm varsa kullanıcıya bildirim gösterir
4. Kullanıcı "Güncelle" dediğinde `config.json` indirilir
5. Key ve APK URL gibi değerler otomatik güncellenir

## ⚠️ Notlar

- Değişiklikler yaklaşık 5 dakika içinde yansır (GitHub cache)
- Kullanıcılar APK indirmeden güncelleme alır
- Sadece config değerleri güncellenir, UI değişmez

---
**TheBestML IMGUI V2.8** 🎮

import { test, expect } from '@playwright/test';
import { waitForHydrationWindow } from './helpers/hydration';

test('Automatic C2d Test', async ({ page }) => {
  await page.goto('https://troy.vodafone.com.tr/c2d-nextjs/numara-tasima-yeni-hat');
  await page.locator('#mnp').getByRole('link', { name: 'Tarifeleri incele' }).click();
  await expect(page.locator('#tariff-4358329').getByRole('button', { name: 'Tarifeyi seç' })).toBeVisible();
  await expect(page.getByText('26 yaş altı gençlere özel')).toBeVisible();
  await page.locator('#tariff-4358329').getByRole('button', { name: 'Tarifeyi seç' }).click();
  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).click();
  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).fill('(555) 555 5501_');
  await page.getByRole('button', { name: 'Onay kodu gönder' }).click();
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 1' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 2' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 3' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 4' }).fill('1');
  await page.getByRole('paragraph').filter({ hasText: '(555) 555 55 02' }).click();
  await page.getByRole('button', { name: 'Onayla ve Devam Et' }).click();
  await page.getByText('Adresime GelsinBu seçeneği se').click();
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await page.getByRole('textbox', { name: 'Ad', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ad', exact: true }).fill('SU');
  await page.getByRole('textbox', { name: 'Ad', exact: true }).press('Tab');
  await page.getByRole('textbox', { name: 'Soyad' }).fill('SU');
  await page.getByRole('textbox', { name: 'Soyad' }).press('Tab');
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).click();
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).fill('78930312586');
  await page.getByRole('textbox', { name: 'Baba Adı' }).click();
  await page.getByRole('textbox', { name: 'Baba Adı' }).fill('SU');
  await page.getByRole('textbox', { name: 'Baba Adı' }).press('Tab');
  await page.getByRole('textbox', { name: 'Doğum Tarihi' }).fill('17/06/2005');
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await page.getByRole('textbox', { name: 'İl', exact: true }).click();
  await page.locator('label').filter({ hasText: 'ADIYAMAN' }).click();
  await page.getByRole('textbox', { name: 'İlçe' }).click();
  await page.locator('label').filter({ hasText: 'ÇELİKHAN' }).click();
  await page.getByRole('textbox', { name: 'Köy' }).click();
  await page.locator('label').filter({ hasText: 'ASKERHAN' }).click();
  await page.getByRole('textbox', { name: 'Mahalle' }).click();
  await page.getByText('KÖYÜN KENDİSİ').click();
  await page.getByRole('textbox', { name: 'Cadde / Sokak' }).click();
  await page.getByText('ASKERHAN KÜME EVLER').click();
  await page.getByRole('textbox', { name: 'Bina' }).click();
  await page.locator('label').filter({ hasText: '10 A' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).fill('su@hotmail.com');
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await expect(page.getByRole('heading', { name: 'Vodafonelu olma talebinizi' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Vodafonelu olma talebinizi aldık');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - img
    - heading "Vodafonelu olma talebinizi aldık" [level=3]
    `);
  await page.getByRole('button', { name: 'E-devlet\'e git' }).click();
  await page.getByRole('button', { name: 'e-Devlet’e git' }).click();
  await expect(page.locator('#contentStart')).toMatchAriaSnapshot(`
    - emphasis: Henüz kimliğinizi doğrulamadınız...
    - paragraph: Bu hizmetten faydalanmak için, aşağıdaki kimlik doğrulama yöntemlerinden sizin için uygun olan bir tanesini kullanarak sisteme giriş yapmış olmanız gerekmektedir.
    - list:
      - listitem: e-Devlet Şifresi
      - listitem: T.C. Kimlik Kartı
    `);
});

test('Simple C2d Test', async ({ page }) => {
  const tariffId = '4358329'
  const mnpNumber = '(555) 555 54 07'
  test.setTimeout(120_000);

  await page.goto('https://troy.vodafone.com.tr/c2d-nextjs/numara-tasima-yeni-hat');
  await page.locator('#mnp').getByRole('link', { name: 'Tarifeleri incele' }).click();
  await waitForHydrationWindow(page);
  await expect(page.getByText('26 yaş altı gençlere özel')).toBeVisible();
  await expect(page.locator(`#tariff-${tariffId}`).getByRole('button', { name: 'Tarifeyi seç' })).toBeVisible();
  await page.locator(`#tariff-${tariffId}`).getByRole('button', { name: 'Tarifeyi seç' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).fill(mnpNumber);
  await page.getByRole('button', { name: 'Onay kodu gönder' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 1' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 2' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 3' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 4' }).fill('1');
  await expect(page.locator('main')).toContainText(mnpNumber);
  // await expect(page.getByRole('paragraph').filter({ hasText: '(555) 555 55' })).toBeVisible();
  // await expect(page.locator('body')).toContainText('(555) 555 55 04');
  await page.getByRole('button', { name: 'Onayla ve Devam Et' }).click();
  await waitForHydrationWindow(page);
  await page.getByText('Adresime GelsinBu seçeneği se').click();
  await waitForHydrationWindow(page);
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('textbox', { name: 'Ad', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ad', exact: true }).fill('SU');
  await page.getByRole('textbox', { name: 'Ad', exact: true }).press('Tab');
  await page.getByRole('textbox', { name: 'Soyad' }).fill('SU');
  await page.getByRole('textbox', { name: 'Soyad' }).press('Tab');
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).click();
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).fill('78930312586');
  await page.getByRole('textbox', { name: 'Baba Adı' }).click();
  await page.getByRole('textbox', { name: 'Baba Adı' }).fill('SU');
  await page.getByRole('textbox', { name: 'Baba Adı' }).press('Tab');
  await page.getByRole('textbox', { name: 'Doğum Tarihi' }).fill('17/06/2005');
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('textbox', { name: 'İl', exact: true }).click();
  await page.locator('label').filter({ hasText: 'ADIYAMAN' }).click();
  await page.getByRole('textbox', { name: 'İlçe' }).click();
  await page.locator('label').filter({ hasText: 'ÇELİKHAN' }).click();
  await page.getByRole('textbox', { name: 'Köy' }).click();
  await page.locator('label').filter({ hasText: 'ASKERHAN' }).click();
  await page.getByRole('textbox', { name: 'Mahalle' }).click();
  await page.getByText('KÖYÜN KENDİSİ').click();
  await page.getByRole('textbox', { name: 'Cadde / Sokak' }).click();
  await page.getByText('ASKERHAN KÜME EVLER').click();
  await page.getByRole('textbox', { name: 'Bina' }).click();
  await page.locator('label').filter({ hasText: '10 A' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).fill('su@hotmail.com');
  await page.getByRole('button', { name: 'Devam Et' }).click();
  await waitForHydrationWindow(page);
  await expect(page.getByRole('heading', { name: 'Vodafonelu olma talebinizi' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Vodafonelu olma talebinizi aldık');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - img
    - heading "Vodafonelu olma talebinizi aldık" [level=3]
    `);
  await page.getByRole('button', { name: 'E-devlet\'e git' }).click();
  await waitForHydrationWindow(page);
  await page.getByRole('button', { name: 'e-Devlet’e git' }).click();
  await waitForHydrationWindow(page);
  await expect(page.locator('#contentStart')).toMatchAriaSnapshot(`
    - emphasis: Henüz kimliğinizi doğrulamadınız...
    - paragraph: Bu hizmetten faydalanmak için, aşağıdaki kimlik doğrulama yöntemlerinden sizin için uygun olan bir tanesini kullanarak sisteme giriş yapmış olmanız gerekmektedir.
    - list:
      - listitem: e-Devlet Şifresi
      - listitem: T.C. Kimlik Kartı
    `);
});

test('Main C2d Test', async ({ page }) => {
  const tariffId = '4358329'
  const mnpNumber = '(555) 555 11 25'
  test.setTimeout(120_000);

  await page.goto('https://troy.vodafone.com.tr/c2d-nextjs/numara-tasima-yeni-hat');
  await page.locator('#mnp').getByRole('link', { name: 'Tarifeleri incele' }).click();
  await expect(page.getByText('26 yaş altı gençlere özel')).toBeVisible();
  await expect(page.locator(`#tariff-${tariffId}`).getByRole('button', { name: 'Tarifeyi seç' })).toBeVisible();
  await waitForHydrationWindow(page);
  await expect(async () => {
    const oldUrl = page.url();
    await page.locator(`#tariff-${tariffId}`).getByRole('button', { name: 'Tarifeyi seç' }).click();
    await expect(page).not.toHaveURL(oldUrl);
  }).toPass({timeout: 5000,intervals: [500],});

  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).click();
  await page.getByRole('textbox', { name: 'Taşımak istediğiniz numara' }).fill(mnpNumber);
  await waitForHydrationWindow(page);
  await page.waitForTimeout(4000);
  await expect(async () => {
    await page.getByRole('button', { name: 'Onay kodu gönder' }).click();
    await page.getByText('Onay kodunu giriniz', { exact: true }).click();
  }).toPass({timeout: 3000,intervals: [500],});

  await expect(page.locator('main')).toContainText(mnpNumber);
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 1' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 2' }).fill('2');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 3' }).fill('2');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 4' }).fill('2');
  await page.getByRole('button', { name: 'Onayla ve Devam Et' }).click();
  await expect(page.locator('form')).toContainText('Girdiginiz sifre hatalidir. Lütfen yeniden deneyiniz.');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 1' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 2' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 3' }).fill('1');
  await page.getByRole('spinbutton', { name: 'Please enter OTP character 4' }).fill('1');
  await waitForHydrationWindow(page);
  await page.waitForTimeout(3000);
  await page.getByRole('button', { name: 'Onayla ve Devam Et' }).click();
  
  await page.getByText('Adresime GelsinBu seçeneği se').click();
  await waitForHydrationWindow(page);
  await expect(async () => {
    const oldUrl = page.url();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    await expect(page).not.toHaveURL(oldUrl);
  }).toPass({timeout: 5000,intervals: [500],});

  await page.getByRole('textbox', { name: 'Ad', exact: true }).click();
  await page.getByRole('textbox', { name: 'Ad', exact: true }).fill('SU');
  await page.getByRole('textbox', { name: 'Ad', exact: true }).press('Tab');
  await page.getByRole('textbox', { name: 'Soyad' }).fill('SU');
  await page.getByRole('textbox', { name: 'Soyad' }).press('Tab');
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).click();
  await page.getByRole('textbox', { name: 'TC Kimlik No' }).fill('78930312586');
  await page.getByRole('textbox', { name: 'Baba Adı' }).click();
  await page.getByRole('textbox', { name: 'Baba Adı' }).fill('SU');
  await page.getByRole('textbox', { name: 'Baba Adı' }).press('Tab');
  await page.getByRole('textbox', { name: 'Doğum Tarihi' }).fill('17/06/2005');
  await waitForHydrationWindow(page);
  await expect(async () => {
    const oldUrl = page.url();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    await expect(page).not.toHaveURL(oldUrl);
  }).toPass({timeout: 5000,intervals: [500],});
  
  await page.getByRole('textbox', { name: 'İl', exact: true }).click();
  await page.locator('label').filter({ hasText: 'ADIYAMAN' }).click();
  await page.getByRole('textbox', { name: 'İlçe' }).click();
  await page.locator('label').filter({ hasText: 'ÇELİKHAN' }).click();
  await page.getByRole('textbox', { name: 'Köy' }).click();
  await page.locator('label').filter({ hasText: 'ASKERHAN' }).click();
  await page.getByRole('textbox', { name: 'Mahalle' }).click();
  await page.getByText('KÖYÜN KENDİSİ').click();
  await page.getByRole('textbox', { name: 'Cadde / Sokak' }).click();
  await page.getByText('ASKERHAN KÜME EVLER').click();
  await page.getByRole('textbox', { name: 'Bina' }).click();
  await page.locator('label').filter({ hasText: '10 A' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).click();
  await page.getByRole('textbox', { name: 'E-Posta' }).fill('su@hotmail.com');
  await waitForHydrationWindow(page);
  await expect(async () => {
    const oldUrl = page.url();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    await expect(page).not.toHaveURL(oldUrl);
  }).toPass({timeout: 5000,intervals: [500],});

  await expect(page.getByRole('heading', { name: 'Vodafonelu olma talebinizi' })).toBeVisible();
  await expect(page.locator('body')).toContainText('Vodafonelu olma talebinizi aldık');
  await expect(page.locator('body')).toMatchAriaSnapshot(`
    - img
    - heading "Vodafonelu olma talebinizi aldık" [level=3]
    `);
  await waitForHydrationWindow(page);
  await expect(async () => {
    await page.getByRole('button', { name: 'E-devlet\'e git' }).click();
    await expect(page.locator('[id="chakra-modal--header-:r3:"]')).toContainText('e-Devlet ile başvurunuzu onaylamak için bilmeniz gerekenler :');
  }).toPass({timeout: 5000,intervals: [500],});

  await page.getByRole('button', { name: 'e-Devlet’e git' }).click();
  await waitForHydrationWindow(page);
  await expect(page.locator('#contentStart')).toMatchAriaSnapshot(`
    - emphasis: Henüz kimliğinizi doğrulamadınız...
    - paragraph: Bu hizmetten faydalanmak için, aşağıdaki kimlik doğrulama yöntemlerinden sizin için uygun olan bir tanesini kullanarak sisteme giriş yapmış olmanız gerekmektedir.
    - list:
      - listitem: e-Devlet Şifresi
      - listitem: T.C. Kimlik Kartı
    `);
});
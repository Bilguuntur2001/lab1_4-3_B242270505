# Лаборатори №1: UI автомат тест — Playwright

**F.CSA313 — Программ хангамжийн чанарын баталгаа ба тест (2026)**
Оюутан: B242270505

Тестлэсэн сайт: [saucedemo.com](https://www.saucedemo.com) — тестэд зориулсан нээлттэй демо дэлгүүр.

## Юу хийсэн бэ

1. `npm init playwright@latest`-ээр TypeScript төсөл үүсгэж, Chromium / Firefox / WebKit хөтчүүдийг суулгасан.
2. [`tests/mytest.spec.ts`](tests/mytest.spec.ts) дотор 6 тест бичсэн. Нийт 3 хөтөч дээр 18 ажиллалт болно:

| # | Бүлэг | Тест | Төрөл |
|---|---|---|---|
| 1 | Амжилттай нэвтрэх | `standard_user` нэвтэрч, Products хуудас, 6 бараа харагдана | Эерэг |
| 2 | Амжилтгүй нэвтрэх | Буруу нууц үгтэй үед алдааны мессеж гарна | Сөрөг |
| 3 | Амжилтгүй нэвтрэх | `locked_out_user` нэвтэрч чадахгүй | Сөрөг |
| 4 | Амжилтгүй нэвтрэх | Username хоосон үед "Username is required" гарна | Сөрөг |
| 5 | Сагс | Бараа сагсалж, badge болон сагсны хуудсыг шалгана | Нэвтэрсний дараах |
| 6 | Сагс | 2 бараа нэмээд 1-ийг хасахад badge зөв тоолно | Нэвтэрсний дараах |

3. **Locator:** зөвхөн `getByRole`, `getByPlaceholder`, `getByText`, `getByTestId` ашигласан. saucedemo элементүүддээ `data-test="..."` атрибут тавьдаг тул `playwright.config.ts` дотор `testIdAttribute: 'data-test'` гэж тохируулсан.
4. **Assertion:** `toBeVisible()`, `toHaveURL()`, `toHaveText()`, `toHaveCount()`, мөн `not.toHaveURL()`.
5. **Logout ба isolation:** нэвтэрсэн тест бүр `logout()` функцээр (эсвэл `afterEach`-ээр) гарч дуусна. Playwright тест бүрд шинэ `BrowserContext` (хоосон cookie/storage) өгдөг. Сагсны тест бүр өөрийн `beforeEach` дотор дахин нэвтэрч, нэмсэн бараагаа өөрөө хасна. Тиймээс тестүүд хоорондоо хамааралгүй бөгөөд `fullyParallel` горимд зэрэг ажиллаж чадна.
6. **Trace / бичлэг / report:** config-д `trace: 'on'`, `video: 'on'` гэж тохируулсан. HTML report нь [`report/`](report/) хавтаст хадгалагдсан бөгөөд тест бүрийн бичлэг (video) болон trace-ийг агуулна.

## Ажиллуулах

```bash
npm ci
npx playwright install
npx playwright test             # 18 тест, 3 хөтөч
npx playwright show-report report
npx playwright show-trace test-results/<тестийн-хавтас>/trace.zip
npx playwright codegen saucedemo.com
```

## Яагаад XPath биш вэ?

XPath нь DOM-ын бүтцэд (`//div[2]/form/input[1]`) уягддаг. Дизайнер нэг `div` нэмэхэд л тест эвдэрнэ. Мөн уншихад хэцүү, хэрэглэгч хуудсыг хэрхэн хардагтай ямар ч холбоогүй. `getByRole('button', { name: 'Login' })` нь хэрэглэгч (болон дэлгэц уншигч) хардаг зүйлд тулгуурладаг. Тиймээс бүтэц өөрчлөгдсөн ч тест ажилласаар байх ба хүртээмжийн (accessibility) асуудлыг давхар илрүүлдэг. `getByTestId` нь хөгжүүлэгч тестэд зориулж тогтвортой гэрээ (contract) болгон тавьсан атрибут юм.

## Codegen ба Trace viewer-ийн ажиглалт

- `npx playwright codegen` нь `getByRole`, `locator('[data-test="..."]')` зэрэг locator гаргаж, үйлдэл бүрийг шууд код болгодог. Гэхдээ зөвхөн үйлдлийг бичдэг: assertion бараг байхгүй, туслах функц, logout, `describe` бүтэц ч байхгүй. Тиймээс эхлэлийн "ноорог" болгоход тохиромжтой ч бэлэн тест биш.
- Trace viewer дээр алхам бүрийн өмнөх/дараах DOM snapshot, сүлжээний хүсэлт, console харагдана. Assertion-ийг санаатай буруу болгож (жишээ нь `'Products'`-ийг `'Product'` болгож) ажиллуулахад алдаа гарсан мөр, тухайн үеийн DOM-ыг шууд харж болдог.
- Бодит жишээ: анх `Logout`-ыг `getByRole('link')` гэж бичсэн. Тест 30 секунд хүлээгээд унасан. Алдааны page snapshot дээр `button "Logout"` гэж харагдсан тул сайт `<a>`-аас `<button>` болж шинэчлэгдсэнийг шууд олж, зассан.

## Playwright ба Selenium — миний ажиглалт

Хоёулаа Apache 2.0 лицензтэй, үнэгүй, нээлттэй эх. Тиймээс сонголт нь техникийн давуу талаас хамаарна. Playwright-д `npx playwright install` гэсэн нэг командаар гурван хөтөч суусан бол Selenium-д хөтөч бүрийн driver-ийн хувилбарыг тааруулах шаардлага гардаг. Хамгийн мэдрэгдсэн ялгаа нь auto-wait: энэ кодонд нэг ч `sleep` эсвэл `WebDriverWait` байхгүй. `click()` болон `expect()` нь элемент бэлэн болтол өөрөө хүлээдэг тул flaky тест цөөн гардаг. `expect(...).toHaveText()` нь web-first assertion бөгөөд нөхцөл биелэх хүртэл дахин шалгадаг. Selenium-д үүнийг гараар бичих хэрэгтэй. Trace viewer болон автомат video/screenshot нь Selenium-ийн лог, скриншотоос хамаагүй илүү мэдээлэл өгч, алдаа мөшгихийг хялбар болгодог. Тест бүр тусдаа browser context-д ажиллах нь isolation-ийг үнэгүй өгч, зэрэгцээ ажиллуулалтыг хялбар болгодог. Нөгөө талаас Selenium нь илүү урт түүхтэй, олон хэл болон хуучин хөтчүүдийг дэмждэг, WebDriver нь W3C стандарт учраас Selenium Grid, cloud үйлчилгээний экосистем нь илүү өргөн. Миний дүгнэлтээр шинэ вэб төсөлд Playwright илүү хурдан, тогтвортой тест бичих боломж олгоно.

## Нэмэлт: AI өнцөг

Тестүүдийг AI туслах (Claude) ашиглан үүсгэж, дараа нь ажиллуулж шалгасан. AI-ийн гаргасан кодод `Logout`-ыг `link` гэж үзсэн алдаа байсан (сайтын одоогийн хувилбарт `button` болсон). 3 хөтөч дээр 9 тест унасныг trace болон page snapshot ашиглан олж зассан. Энэ нь AI сайтын хуучин бүтцийг "санаж" бичдэг, тиймээс тестийг заавал бодит сайт дээр ажиллуулж баталгаажуулах ёстойг харуулж байна. Мөн codegen-тэй адил AI ч assertion-ийг заримдаа сул бичдэг тул нэмж чангатгасан.

## Бүтэц

```
├── tests/mytest.spec.ts    # Тестүүд (дэлгэрэнгүй коммент бүхий)
├── playwright.config.ts    # baseURL, testIdAttribute, trace, video, reporter
├── report/                 # HTML report (video + trace) — `npx playwright show-report report`
└── .gitignore              # node_modules, test-results гэх мэт
```

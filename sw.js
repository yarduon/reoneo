if (!self.define) {
  let e,
    i = {};
  const s = (s, n) => (
    (s = new URL(s + ".js", n).href),
    i[s] ||
      new Promise((i) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = s), (e.onload = i), document.head.appendChild(e);
        } else (e = s), importScripts(s), i();
      }).then(() => {
        let e = i[s];
        if (!e) throw new Error(`Module ${s} didn’t register its module`);
        return e;
      })
  );
  self.define = (n, c) => {
    const o =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (i[o]) return;
    let r = {};
    const a = (e) => s(e, o),
      f = { module: { uri: o }, exports: r, require: a };
    i[o] = Promise.all(n.map((e) => f[e] || a(e))).then((e) => (c(...e), r));
  };
}
define(["./workbox-168f09f0"], function (e) {
  "use strict";
  self.addEventListener("message", (e) => {
    e.data && "SKIP_WAITING" === e.data.type && self.skipWaiting();
  }),
    e.precacheAndRoute(
      [
        {
          url: "audio/alert.mp3",
          revision: "d2fa2a1496a56b6179e8fc1aed9237ad",
        },
        {
          url: "audio/finish.mp3",
          revision: "28ab7cb69f6910b466221f5a82724a89",
        },
        { url: "css/fonts.css", revision: "91d9eea066020887c79a1ffba893ad9f" },
        { url: "css/main.css", revision: "8822a17fba2155c42f91ffc505e293ce" },
        {
          url: "css/position.css",
          revision: "d49bc9a6278e4f6c608c9fbb63498ca3",
        },
        { url: "css/reset.css", revision: "821f47d254bfd553248ed3c8a060b4dd" },
        {
          url: "css/responsive.css",
          revision: "38e27ae6a7306a3611fcdb8981b3d9d8",
        },
        {
          url: "fonts/anton.ttf",
          revision: "055c4df4e2f8c7a4d4675cdd8fa68da0",
        },
        { url: "FUNDING.yml", revision: "c21af649c611bd5a3389bd3401dd5c71" },
        {
          url: "img/backgrounds/black.png",
          revision: "61e40c76055b8b229f628af1f792ff7d",
        },
        {
          url: "img/favicon.png",
          revision: "784f0f20382217254bf54cd388728115",
        },
        {
          url: "img/icons/burger.svg",
          revision: "e2bf154b01647ade46f8d424cdff6af8",
        },
        {
          url: "img/icons/edit.svg",
          revision: "bfb47eb1515209874d7d1c97347608db",
        },
        {
          url: "img/icons/minus.svg",
          revision: "c698b370d4ddca8891b5ac50d7179185",
        },
        {
          url: "img/icons/play.svg",
          revision: "b292134dd141bca477736449c37556bb",
        },
        {
          url: "img/icons/plus.svg",
          revision: "508457fe6220c20fc69990c011927909",
        },
        {
          url: "img/icons/reset.svg",
          revision: "978406db962f06f789fe692431f0aeaf",
        },
        {
          url: "img/icons/save.svg",
          revision: "4b83de597bb3d5418805bc15340062e1",
        },
        {
          url: "img/icons/stop.svg",
          revision: "4682f49259b07c0403ffb872000e0030",
        },
        {
          url: "img/logos/white_penguin_128x128.png",
          revision: "521069a5755644473fe94126ee966ab5",
        },
        {
          url: "img/pwa/badges/android_en.png",
          revision: "0fb68f4e9f4829171a3fcdd8d8410512",
        },
        {
          url: "img/pwa/badges/windows_en.png",
          revision: "b0fcac80538b2edd50436817b1fb7fc4",
        },
        {
          url: "img/pwa/icons/reoneo_icon_1024x1024.png",
          revision: "5d0fb6ad81202d44db3807b3a680fe58",
        },
        {
          url: "img/pwa/icons/reoneo_icon_128x128.png",
          revision: "28eeb870520bea48687e477fb0f96a3e",
        },
        {
          url: "img/pwa/icons/reoneo_icon_144x144.png",
          revision: "b76bf7cbd2b1ea163f92b174755ff93a",
        },
        {
          url: "img/pwa/icons/reoneo_icon_192x192.png",
          revision: "2e0becc3136c010fa5db66dc9ca188c9",
        },
        {
          url: "img/pwa/icons/reoneo_icon_256x256.png",
          revision: "1b41595135dbb74d3fa04d3e7dc57800",
        },
        {
          url: "img/pwa/icons/reoneo_icon_32x32.png",
          revision: "e667b95363b51d1b2aee74169ddb68b8",
        },
        {
          url: "img/pwa/icons/reoneo_icon_384x384.png",
          revision: "68fe488dab7781e9ba73552f20583173",
        },
        {
          url: "img/pwa/icons/reoneo_icon_48x48.png",
          revision: "15087e6d2028ebd1f8ce5b7c4671c44e",
        },
        {
          url: "img/pwa/icons/reoneo_icon_512x512.png",
          revision: "3f4ef19f960ef77094e41cd905e1d148",
        },
        {
          url: "img/pwa/icons/reoneo_icon_64x64.png",
          revision: "7a54b8844c605bcb5895bcccade02acb",
        },
        {
          url: "img/pwa/icons/reoneo_icon_72x72.png",
          revision: "7b5f3bfb45f2b5690775366d8f8dc7ae",
        },
        {
          url: "img/pwa/icons/reoneo_icon_96x96.png",
          revision: "4044529632911d6192bfa76cc10df6ab",
        },
        {
          url: "img/pwa/screenshots/computer_nine_teams.png",
          revision: "3f4195d8efa77e833560b92e2d7fcabc",
        },
        {
          url: "img/pwa/screenshots/computer_six_teams.png",
          revision: "2123d9392afd918d58ace44e310f15ec",
        },
        {
          url: "img/pwa/screenshots/computer_two_teams.png",
          revision: "a3145d827d912f772afd387924f74206",
        },
        {
          url: "img/pwa/screenshots/mobile_five_teams.png",
          revision: "97d19b3321ead93b408580a2bc38392b",
        },
        {
          url: "img/pwa/screenshots/mobile_six_teams.png",
          revision: "a420c3a4f36c583d4fcc696a9faf396d",
        },
        {
          url: "img/pwa/screenshots/mobile_two_teams.png",
          revision: "3bd5779739715abef89bae9e3c23d344",
        },
        {
          url: "img/pwa/screenshots/tablet_10inch_nine_teams.png",
          revision: "5138f31c60b80234133e7f3e300a08da",
        },
        {
          url: "img/pwa/screenshots/tablet_10inch_six_teams.png",
          revision: "d61a76470dd891339367fe6bd109d6a3",
        },
        {
          url: "img/pwa/screenshots/tablet_10inch_two_teams.png",
          revision: "0bfe14febc91970844f3830e5f7595cd",
        },
        {
          url: "img/pwa/screenshots/tablet_7inch_nine_teams.png",
          revision: "44d0f079fcd66cf5e4492c2d8e43ee36",
        },
        {
          url: "img/pwa/screenshots/tablet_7inch_six_teams.png",
          revision: "b1e0361f2b1aeb76dd38848362142ed0",
        },
        {
          url: "img/pwa/screenshots/tablet_7inch_two_teams.png",
          revision: "ca08deda589a20b632d71f96d3a05ed2",
        },
        { url: "index.html", revision: "8d351299c0953d2ea8451a076633c81b" },
        { url: "js/main.js", revision: "cca9b147700587172f27a9cf9fa41631" },
        { url: "js/utility.js", revision: "15239c4f095ef6ad30470093cac684b4" },
        {
          url: "json/languages.js",
          revision: "ec7c7689abad3a06866e69aef7e2868f",
        },
        {
          url: "json/options.js",
          revision: "729f462a6f4048b19abe4dfcd636d53a",
        },
        { url: "json/scores.js", revision: "a70354ae8cbe81b4f488b1fa95f51f81" },
        { url: "json/teams.js", revision: "cf48d0d05e50f47b5cc3278b3f25d1d9" },
        { url: "manifest.json", revision: "c4658bf5ba4ce7a8ccb2c99995efd805" },
        { url: "README.md", revision: "736024d0b93cccfee1b2e085ecf4c75f" },
      ],
      { ignoreURLParametersMatching: [/^utm_/, /^fbclid$/] }
    );
});
//# sourceMappingURL=sw.js.map


module.exports = {
  packagerConfig: {
    asar: true,
    icon: "public/favicon.ico",
    arch: "x64",
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: "chintpurni_plywood_ims",
        title: "Chintpurni Plywood IMS",
        authors: "Viral Gupta",
        description: "Chintpurni Plywood IMS",
        iconUrl: "https://www.thrusttechindia.in/favicon.ico",
        setupExe: "CTC-IMS.exe",
        setupIcon: "public/favicon.ico",
      },
    }
  ]
};
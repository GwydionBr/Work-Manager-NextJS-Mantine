const paths = {
  home() {
    return "/";
  },

  auth: {
    login() {
      return "/auth?defaultType=login";
    },
    register() {
      return "/auth?defaultType=register";
    },
  },

  work: {
    workPage() {
      return "/work";
    },

    workDetailsPage(projectId: string) {
      return `/work/${projectId}`;
    },
  },

  finances: {
    financesPage() {
      return "/finances";
    },
  },

  analytics: {
    analyticsPage() {
      return "/analytics";
    },
  },

  account: {
    accountPage() {
      return "/account";
    },
  },

  settings: {
    settingsPage() {
      return "/settings";
    },
  },
};

export default paths;

const paths = {
  home() {
    return '/';
  },

  auth: {
    login() {
      return '/auth?defaultType=login';
    },
    register() {
      return '/auth?defaultType=register';
    }
  },

  work: {
    workPage() {
      return '/work';
    },
  },

  finances: {
    financesPage() {
      return '/finances';
    },
  },

  account: {
    accountPage() {
      return '/account';
    },
  },

  settings: {
    settingsPage() {
      return '/settings';
    },
  },
};

export default paths;
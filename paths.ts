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
  }
};

export default paths;
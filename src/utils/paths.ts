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

  workCalendar: {
    workCalendarPage() {
      return "/workCalendar";
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

  groupManager: {
    groupManagerPage() {
      return "/groupManager";
    },
  },

  tasks: {
    tasksPage() {
      return "/tasks";
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

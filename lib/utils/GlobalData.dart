class GlobalData {
  static String userId = '';
  static String firstName = '';
  static String lastName = '';
  static String loginName = '';
  static String password = '';
  static String token = '';
  static int credits = 0;


  static void clear() {
    token = '';
    loginName = '';
    password = '';
    firstName = '';
    lastName = '';
    userId = '';
    credits = 0;
  }

}

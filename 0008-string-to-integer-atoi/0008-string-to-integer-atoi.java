class Solution {
    public int myAtoi(String s) {

        int i = 0;

        // skip starting spaces
        while (i < s.length() && s.charAt(i) == ' ') {
            i++;
        }

        int sign = 1;

        // check sign
        if (i < s.length()) {
            if (s.charAt(i) == '-') {
                sign = -1;
                i++;
            } else if (s.charAt(i) == '+') {
                i++;
            }
        }

        long num = 0;

        while (i < s.length()) {

            char ch = s.charAt(i);

            if (ch < '0' || ch > '9') {
                break;
            }

            num = num * 10 + (ch - '0');

            if (sign == 1 && num > Integer.MAX_VALUE) {
                return Integer.MAX_VALUE;
            }

            if (sign == -1 && -num < Integer.MIN_VALUE) {
                return Integer.MIN_VALUE;
            }

            i++;
        }

        return (int)(sign * num);
    }
}

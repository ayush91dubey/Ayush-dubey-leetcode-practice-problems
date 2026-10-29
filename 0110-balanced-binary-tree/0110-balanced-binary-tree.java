class Solution {
    boolean balance;
    public boolean isBalanced(TreeNode root) {
        balance = true;
        helper(root);
        return balance;
        
    }
     int helper(TreeNode root){
        if(root==null)
        return 0;
        int left=helper(root.left);
         int right=helper(root.right);
         if(Math.abs(left-right)>1){
            balance=false;
         }
         return Math.max(left,right)+1;
     }
}

//time complexity is O(n)
class Solution {
    public int firstMissingPositive(int[] nums) {
        int n=nums.length;
         for(int i=0;i<n;i++){
            while(nums[i]>0 && nums[i]<=n && nums[nums[i]-1]!=nums[i]){
              //we are swapping the values if the condition is true
                int correctIndex=nums[i]-1;
                int temp=nums[correctIndex];
                 nums[correctIndex]=nums[i];  
                 nums[i]=temp;
      
            }
         }
         //2nd loop for check what is the minimum value should be there at that index nums[i]
               for(int i=0; i<n;i++){
                if(nums[i]!=i+1)
                return i+1;

               }
       
         
        return  n+1;
    }
}
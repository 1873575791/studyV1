import Test from '@/components/Test';
import { useEffect, useRef } from 'react';
// import IndexDB from './indexDB.js';

export default function IndexPage() {
  const page = useRef({
    db: null,
  });

  // 防抖
  const de = (fn: Function, time: number) => {
    let timer: any = null;
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn();
      }, time);
    };
  };

  const de2 = (fn: Function, time: number) => {
    let oldTime = new Date() * 1;
    return () => {
      const nowTime = new Date() * 1;
      if (nowTime - oldTime > time) {
        fn();
        oldTime = nowTime;
      }
    };
  };

  const lengthOfLongestSubstring = (s) => {
    let start = 0; // 窗口起始位置
    let maxLength = 0; // 最长不重复子串的长度
    let seen = new Set(); // 用于存储窗口内的字符
    for (let end = 0; end < s.length; end++) {
      // 如果当前字符已经在窗口内，则移动窗口的起始位置
      while (seen.has(s[end])) {
        seen.delete(s[start]);
        start+=1;
      } // 将当前字符添加到窗口内
      seen.add(s[end]); // 更新最长不重复子串的长度
      maxLength = Math.max(maxLength, end - start + 1);
    }
    return `${maxLength} ${start}`;
  };

  const handleClick2 = de2(() => {
    console.log('div');
  }, 1000);

  const handleClick = de(() => {
    console.log('div');
  }, 1000);

  var rotate = (nums, k) => {
    const str = nums.join('');
    const s = str.slice(nums.length-k);
    const s2 = str.slice(0, nums.length-k);
    const newStr = s + s2;
    for (let i = 0; i < nums.length; i++) {
      nums[i] = newStr[i] * 1;
    }
    return nums;
};

  const _init = async () => {
    const allArr = [...[1,2,3,0,0,0], ...[2,5,6]];
    allArr.sort((a, b)=> a - b);
    console.log(allArr)
    // return newArr;
    console.log(lengthOfLongestSubstring('abcabcbb'))
    console.log(rotate([1,2,3,4,5,6,7], 3))
    
    // page.current.db = new IndexDB('test', 1);
    // await page.current.db.open();
    // await page.current.db.add({ name: 'test' });
  };

  useEffect(() => {
    _init();
  });

  return (
    <div>
      <button onClick={handleClick2}>节流</button>
      <button onClick={handleClick}>防抖</button>
      <Test />
      {/* <div onClick={handleClick} ref={div}>123</div> */}
    </div>
  );
}

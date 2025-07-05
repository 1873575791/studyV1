import { useState } from 'react';
import './index.less';
import { Switch } from 'antd';

export default function Index() {
  const [flag, setFlag] = useState(true);
  return (
    <div>
      <Switch checked={flag} onChange={() => setFlag(!flag)} />
      <div className={`index ${flag ? '' : 'indexAction'}`}>
        <div className={`contentMoon ${!flag ? 'contentMoonAc' : ''}`}>
          <div className="moon">
            <div className={`moonDom ${flag ? 'moonDomAc' : ''}`}></div>
          </div>
        </div>
        <div className={`contentSun ${flag ? 'contentSunAc' : ''}`}>
          <div className="sun"></div>
        </div>
        <div className="mask"></div>
      </div>
    </div>
  );
}

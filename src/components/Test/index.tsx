import './index.less';

export default function Test() {
  const data = [
    {
      date: '2017-06-05',
      value: 116,
      value2: 100,
    },
    {
      date: '2017-06-06',
      value: 129,
      value2: 100,
    },
    {
      date: '2017-06-07',
      value: 135,
      value2: 100,
    },
    {
      date: '2017-06-08',
      value: 86,
      value2: 100,
    },
    {
      date: '2017-06-09',
      value: 73,
      value2: 100,
    },
    {
      date: '2017-06-10',
      value: 85,
      value2: 100,
    },
    {
      date: '2017-06-11',
      value: 73,
      value2: 100,
    },
    {
      date: '2017-06-12',
      value: 68,
      value2: 100,
    },
    {
      date: '2017-06-13',
      value: 92,
      value2: 100,
    },
    {
      date: '2017-06-14',
      value: 130,
      value2: 100,
    },
    {
      date: '2017-06-15',
      value: 245,
      value2: 100,
    },
    {
      date: '2017-06-16',
      value: 139,
      value2: 100,
    },
    {
      date: '2017-06-17',
      value: 115,
      value2: 100,
    },
    {
      date: '2017-06-18',
      value: 111,
      value2: 100,
    },
  ];
  return (
    <div>
      <div className="container">
        <div className="v-scroll">
          <div className="list">
          {data.map((item) => {
              return (
                <div className="item" key={item.date}>
                  <div>{item.date}</div>
                  <div>{item.value}</div>
                  <div>{item.value2}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

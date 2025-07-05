import Matter from 'matter-js';
import { useEffect, useRef } from 'react';

export default function Matters() {
  const matter = useRef({});
  const add = () => {
    // 创建一个动态的球体
    const ball = Matter.Bodies.circle(400, 100, 50, {
      density: 0.004,
      restitution: 0.9,
      render: {
        fillStyle: 'red',
      },
    });
    Matter.World.add(matter.current.world, [ball]);
  };
  useEffect(() => {
    // 创建引擎
    const engine = Matter.Engine.create();
    const world = engine.world;
    matter.current.world = world;
    // 设置 Y 轴方向上的重力
    engine.gravity.y = 1;

    // 创建地面
    const ground = Matter.Bodies.rectangle(400, 610, 810, 60, {
      isStatic: true,
      render: { visible: true },
    });
    const ground2 = Matter.Bodies.rectangle(0, 200, 60, 810, {
      isStatic: true,
      render: { visible: true },
    });
    const ground3 = Matter.Bodies.rectangle(810, 200, 60, 810, {
        isStatic: true,
        render: { visible: true },
      });
    Matter.World.add(world, [ground, ground2, ground3]);

    // 创建一个动态的球体
    const ball = Matter.Bodies.circle(400, 100, 50, {
      density: 0.004,
      restitution: 0.9,
      render: {
        fillStyle: 'red',
      },
    });
    Matter.World.add(world, [ball]);

    // 运行引擎
    var runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    // Matter.Runner.run(engine);

    // 渲染设置
    const render = Matter.Render.create({
      canvas: document.getElementById('Matters'),
      engine: engine,
      options: {
        width: 800,
        height: 600,
        wireframes: false,
      },
    });
    Matter.Render.run(render);
  }, []);

  return (
    <div>
      <button onClick={add}>+</button>
      <canvas id="Matters" />
    </div>
  );
}

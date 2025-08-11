import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed database...');

  // 清理现有数据（开发环境）
  if (process.env.NODE_ENV === 'development') {
    await prisma.comment.deleteMany();
    await prisma.summary.deleteMany();
    await prisma.topic.deleteMany();
  }

  // 创建示例议题
  const topic1 = await prisma.topic.create({
    data: {
      title: '人工智能对未来工作的影响',
    },
  });

  const topic2 = await prisma.topic.create({
    data: {
      title: '城市化进程中的环境保护挑战',
    },
  });

  const topic3 = await prisma.topic.create({
    data: {
      title: '远程工作模式的利弊分析',
    },
  });

  // 为第一个议题添加几条评论
  await prisma.comment.createMany({
    data: [
      {
        content: 'AI会替代很多重复性工作，但也会创造新的就业机会。',
        author: '张三',
        topicId: topic1.id,
      },
      {
        content: '关键在于如何进行技能转型和教育升级。',
        author: '李四',
        topicId: topic1.id,
      },
      {
        content: '政府应该制定相应的政策来保障劳动者权益。',
        author: '王五',
        topicId: topic1.id,
      },
    ],
  });

  // 为第二个议题添加评论
  await prisma.comment.createMany({
    data: [
      {
        content: '城市扩张与生态保护确实存在矛盾。',
        author: '赵六',
        topicId: topic2.id,
      },
      {
        content: '可以考虑发展垂直农业和绿色建筑。',
        author: '钱七',
        topicId: topic2.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log(`Created topics: ${topic1.title}, ${topic2.title}, ${topic3.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

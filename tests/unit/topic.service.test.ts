import { createTopic, getAllTopics } from '@/features/topics/topic.service';
import { prisma } from '@/lib/prisma';

// Mock Prisma for unit testing
jest.mock('@/lib/prisma', () => ({
  prisma: {
    topic: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Topic Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllTopics', () => {
    it('should fetch all topics ordered by creation date', async () => {
      const mockTopics = [
        { id: '1', title: 'Test Topic', createdAt: new Date(), status: 'active' },
      ];

      mockPrisma.topic.findMany.mockResolvedValue(mockTopics as any);

      const result = await getAllTopics();

      expect(mockPrisma.topic.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockTopics);
    });
  });

  describe('createTopic', () => {
    it('should create a new topic with given title', async () => {
      const mockTopic = { id: '1', title: 'New Topic', createdAt: new Date(), status: 'active' };

      mockPrisma.topic.create.mockResolvedValue(mockTopic as any);

      const result = await createTopic('New Topic');

      expect(mockPrisma.topic.create).toHaveBeenCalledWith({
        data: { title: 'New Topic' },
      });
      expect(result).toEqual(mockTopic);
    });
  });
});

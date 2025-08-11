
import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/exceptions';

/**
 * Fetches a list of all topics, ordered by creation date.
 * @returns {Promise<Topic[]>} A promise that resolves to an array of topics.
 */
export async function getAllTopics() {
  return prisma.topic.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Creates a new topic with the given title.
 * @param {string} title - The title of the new topic.
 * @returns {Promise<Topic>} A promise that resolves to the newly created topic.
 */
export async function createTopic(title: string) {
  return prisma.topic.create({
    data: {
      title,
    },
  });
}

/**
 * Fetches a single topic by its ID, including all its nested comments and summaries.
 * This creates the full "wisdom tree" for a given topic.
 * @param {string} id - The CUID of the topic to fetch.
 * @returns {Promise<Topic>} A promise that resolves to the topic with its relations.
 * @throws {NotFoundError} If no topic with the given ID is found.
 */
export async function getTopicTree(id: string) {
  const topic = await prisma.topic.findUnique({
    where: { id },
    include: {
      // Include top-level comments related to the topic
      comments: true,
      // Include top-level summaries and their nested children
      summaries: {
        include: {
          comments: true,
          // Recursive inclusion of summaries
          children: {
            include: {
              comments: true,
              children: true, // This can be nested deeper if needed
            },
          },
        },
      },
    },
  });

  if (!topic) {
    throw new NotFoundError('Topic');
  }

  return topic;
}

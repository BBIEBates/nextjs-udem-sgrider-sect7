"use server";

import type { Post, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import paths from "@/paths";
import { Topic } from "@prisma/client";

type TopicData = {
  id: string;
  slug: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

interface CreatePostFormState {
  errors: {
    title?: string[];
    content?: string[];
    _form?: string[];
  };
}

export async function createPost(
  slug: string,
  formState: CreatePostFormState,
  formData: FormData
): Promise<CreatePostFormState> {
  const result = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get('content')
  });

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors
    }
  }

  const session = await auth();
  if (!session || !session.user) {
    return {
      errors: {
        _form: ["You must be logged in."]
      },
    };
  }

  //kept getting error on topic.id - wasn't recognizing that the Topic data type defined in
  //Prisma schema has an id. no clue. makes no sense.
  //Use Prisma.TopicGetPayload<> to select which properties to get back in the return object
  const topic: Prisma.TopicGetPayload<{
    select: {
      id: true;
      slug: true;
      description: true;
      createdAt: true;
      updatedAt: true;
    };
  }> | null = await db.topic.findFirst({
    where: { slug },
    select: {
      id: true,
      slug: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  
  if (!topic?.id) {
    return {
      errors: {
        _form: ["Cannot find topic."]
      }
    }
  }

  let post: Post;
  try {
    post = await db.post.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        userId: session.user.id,
        topicId: topic.id
      }
    })
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        errors: {
          _form: [err.message]
        }
      }
    } else {
      return {
        errors: {
          _form: ["Failed to create post."]
        }
      }
    }
  }
  revalidatePath(paths.topicShow(slug));
  redirect(paths.postShow(slug, post.id))
}

import Link from "next/link"
import { Chip } from "@nextui-org/react";
import { db } from "@/db";
import paths from "@/paths";

const TopicList = async () => {
  const topics = await db.topic.findMany();

  const renderedTopics = topics.map( (topic) => {
    return (
      <div key={topic.id}>
        <Link href={paths.topicShow(topic.slug)}>
          <Chip color="warning" variant="shadow">
            {topic.slug}
          </Chip>
        </Link>
      </div>
    )
  })

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {renderedTopics}
    </div>
  )
}

export default TopicList

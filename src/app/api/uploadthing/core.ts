import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const f = createUploadthing()

export const ourFileRouter = {
  logoUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const session = await auth.api.getSession({
        headers: await headers(),
      })

      if (!session?.user) {
        throw new Error("Unauthorized")
      }

      const [user] = await db
        .select({ level: users.level })
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1)

      if (!user || user.level !== 1) {
        throw new Error("Only admin users can upload logos")
      }

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("[UploadThing] Logo uploaded by userId:", metadata.userId)
      console.log("[UploadThing] File URL:", file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

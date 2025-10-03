import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function KanbanSkeleton() {
  const mockStages = Array.from({ length: 5 }, (_, i) => i)
  const mockCards = Array.from({ length: 3 }, (_, i) => i)

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-10 bg-card border-b border-border/50 p-6 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 p-6 h-full min-w-max">
            {mockStages.map((stage) => (
              <div
                key={stage}
                className="nexus-card flex flex-col w-80 flex-shrink-0 bg-muted/30"
              >
                <div className="p-4 border-b border-border/50 flex-shrink-0 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold bg-primary/10 text-primary border-0">
                      <Skeleton className="h-4 w-6" />
                    </Badge>
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>

                <div className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-3">
                    {mockCards.map((card) => (
                      <Card
                        key={card}
                        className="cursor-pointer border-0 shadow-sm bg-card"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <Skeleton className="h-5 w-full" />

                            <div className="flex items-center justify-between">
                              <Skeleton className="h-7 w-24" />
                              <Skeleton className="h-5 w-12" />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center space-x-2">
                                <Skeleton className="w-6 h-6 rounded-full" />
                                <Skeleton className="h-4 w-20" />
                              </div>
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

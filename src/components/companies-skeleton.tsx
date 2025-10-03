import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function CompaniesSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="h-8 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <Button disabled className="gap-2 w-32">
          <div className="h-4 bg-muted rounded w-full" />
        </Button>
      </div>

      <div className="relative">
        <div className="h-10 bg-muted rounded" />
      </div>

      <div className="grid gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-6 bg-muted rounded w-48" />
                    <div className="flex gap-4">
                      <div className="h-3 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-32" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="w-8 h-8 bg-muted rounded" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="w-6 h-5 bg-muted rounded" />
                </div>
                <Button disabled variant="outline" size="sm" className="gap-2 w-36">
                  <div className="h-3 bg-muted rounded w-full" />
                </Button>
              </div>

              <div className="grid gap-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <div className="h-4 bg-muted rounded w-24" />
                        <div className="h-3 bg-muted rounded w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-5 bg-muted rounded w-16" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-muted rounded" />
                        <div className="h-3 bg-muted rounded w-24" />
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <div className="w-8 h-8 bg-muted rounded" />
                      <div className="w-8 h-8 bg-muted rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

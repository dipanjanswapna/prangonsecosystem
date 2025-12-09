'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ModeratorDashboard() {
  const reports = [
    { id: 1, user: 'John Doe', reason: 'Spamming', content: 'Check out my new website!', status: 'Pending' },
    { id: 2, user: 'Jane Smith', reason: 'Inappropriate Content', content: '...', status: 'Resolved' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Moderator Dashboard</CardTitle>
          <CardDescription>
            Review content, handle reports, and manage community interactions.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Content Moderation Queue</CardTitle>
          <CardDescription>
            Review user-submitted content that requires approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No content to review at the moment.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report Handling</CardTitle>
          <CardDescription>
            Address reports submitted by the community.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>{report.user}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'Pending' ? 'destructive' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

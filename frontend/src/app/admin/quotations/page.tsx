'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Download,
} from 'lucide-react';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';
import { QuotationDetailModal } from '@/components/quotations/QuotationDetailModal';
import { useAllQuotations, useApproveQuotation, useRejectQuotation, useStaffReply, useConvertQuotationToOrder } from '@/hooks/useQuotations';
import { Quotation, QuotationStatus } from '@/types/quotation';
import { toast } from 'sonner';

export default function AdminQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // API hooks
  const { quotations, loading, error, refetch } = useAllQuotations({
    page: 1,
    limit: 50,
    status: selectedStatus === 'all' ? undefined : selectedStatus as QuotationStatus,
    search: searchTerm || undefined
  });

  const { approveQuotation, loading: approveLoading } = useApproveQuotation();
  const { rejectQuotation, loading: rejectLoading } = useRejectQuotation();
  const { addStaffReply, loading: replyLoading } = useStaffReply();
  const { convertQuotationToOrder, loading: convertLoading } = useConvertQuotationToOrder();

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case QuotationStatus.APPROVED:
        return 'bg-blue-100 text-blue-800';
      case QuotationStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case QuotationStatus.CONVERTED:
        return 'bg-green-100 text-green-800';
      case QuotationStatus.EXPIRED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.PENDING:
        return Clock;
      case QuotationStatus.APPROVED:
        return CheckCircle;
      case QuotationStatus.REJECTED:
        return XCircle;
      case QuotationStatus.CONVERTED:
        return DollarSign;
      case QuotationStatus.EXPIRED:
        return Clock;
      default:
        return Clock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleApprove = async (quotation: Quotation, staffNotes?: string) => {
    try {
      const success = await approveQuotation(quotation._id, {
        staffNotes: staffNotes || undefined
      });
      if (success) {
        toast.success('Quotation approved successfully!');
        setIsDetailModalOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error('Failed to approve quotation');
    }
  };

  const handleReject = async (quotation: Quotation, reason: string, staffNotes?: string) => {
    try {
      const success = await rejectQuotation(quotation._id, {
        reason,
        staffNotes: staffNotes || undefined
      });
      if (success) {
        toast.success('Quotation rejected successfully!');
        setIsDetailModalOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error('Failed to reject quotation');
    }
  };

  const handleReply = async (quotation: Quotation, message: string) => {
    try {
      const success = await addStaffReply(quotation._id, {
        message
      });
      if (success) {
        toast.success('Reply sent successfully!');
        refetch();
      }
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const handleConvert = async (quotation: Quotation) => {
    try {
      const success = await convertQuotationToOrder(quotation._id);
      if (success) {
        toast.success('Quotation converted to order successfully!');
        setIsDetailModalOpen(false);
        refetch();
      }
    } catch (error) {
      toast.error('Failed to convert quotation to order');
    }
  };

  const handleViewDetails = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsDetailModalOpen(true);
  };

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });


  return (
    <AdminLayout>
      <RoleGuard permission={Permission.MANAGE_QUOTATIONS}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations Management</h1>
              <p className="text-gray-600">Manage and review customer quotations</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-sm">
                Total: {quotations.length}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Pending: {quotations.filter(q => q.status === QuotationStatus.PENDING).length}
              </Badge>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search quotations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value={QuotationStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={QuotationStatus.APPROVED}>Approved</SelectItem>
                      <SelectItem value={QuotationStatus.REJECTED}>Rejected</SelectItem>
                      <SelectItem value={QuotationStatus.CONVERTED}>Converted</SelectItem>
                      <SelectItem value={QuotationStatus.EXPIRED}>Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotations Table */}
          <Card>
            <CardHeader>
              <CardTitle>Quotations ({filteredQuotations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading quotations...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load quotations</p>
                    <Button onClick={() => refetch()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : filteredQuotations.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No quotations found</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quotation #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotations.map((quotation) => (
                      <TableRow key={quotation._id}>
                        <TableCell className="font-medium">
                          {quotation.quotationNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{quotation.customerName}</div>
                            <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                            {quotation.customerPhone && (
                              <div className="text-sm text-gray-500">{quotation.customerPhone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {quotation.items.map((item: any, index: number) => (
                              <div key={index} className="text-sm">
                                {item.productName} x{item.quantity}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-right">
                            <div className="font-medium">${quotation.totalAmount.toFixed(2)}</div>
                            {quotation.discount > 0 && (
                              <div className="text-sm text-green-600">
                                -${quotation.discount.toFixed(2)} discount
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(quotation.status)}>
                            <span className="flex items-center gap-1">
                              {React.createElement(getStatusIcon(quotation.status), { className: "h-3 w-3" })}
                              {quotation.status}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(quotation.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {formatDate(quotation.validUntil)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewDetails(quotation)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {quotation.prescriptionFile && (
                                <DropdownMenuItem>
                                  <Download className="mr-2 h-4 w-4" />
                                  Download Prescription
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quotation Detail Modal */}
          <QuotationDetailModal
            quotation={selectedQuotation}
            isOpen={isDetailModalOpen}
            onClose={() => {
              setIsDetailModalOpen(false);
              setSelectedQuotation(null);
            }}
            onApprove={handleApprove}
            onReject={handleReject}
            onReply={handleReply}
            onConvert={handleConvert}
            isStaff={true}
            loading={approveLoading || rejectLoading || replyLoading || convertLoading}
          />
        </div>
      </RoleGuard>
    </AdminLayout>
  );
}

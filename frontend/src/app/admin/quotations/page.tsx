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

export default function AdminQuotationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [staffNotes, setStaffNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [replyMessage, setReplyMessage] = useState('');

  // Mock data - replace with actual API calls
  const quotations = [
    {
      _id: '1',
      quotationNumber: 'QUO-20241201-1234',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerPhone: '+1 234 567 8900',
      items: [
        { productName: 'Ray-Ban Aviator', quantity: 1, unitPrice: 150, totalPrice: 150 },
        { productName: 'Custom Lenses', quantity: 1, unitPrice: 100, totalPrice: 100 },
      ],
      subtotal: 250,
      tax: 25,
      discount: 0,
      totalAmount: 275,
      status: 'pending',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer needs prescription lenses for reading',
      prescriptionFile: 'prescription_1234.pdf',
      createdAt: '2024-12-01T10:30:00Z',
      staffReplies: [
        {
          message: 'We can offer a 10% discount on this quotation',
          staffId: 'staff1',
          repliedAt: '2024-12-01T11:00:00Z'
        }
      ]
    },
    {
      _id: '2',
      quotationNumber: 'QUO-20241201-1235',
      customerName: 'Jane Smith',
      customerEmail: 'jane@example.com',
      customerPhone: '+1 234 567 8901',
      items: [
        { productName: 'Oakley Sunglasses', quantity: 2, unitPrice: 120, totalPrice: 240 },
      ],
      subtotal: 240,
      tax: 24,
      discount: 0,
      totalAmount: 264,
      status: 'approved',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer approved the quotation',
      prescriptionFile: null,
      createdAt: '2024-11-30T15:45:00Z',
      approvedAt: '2024-11-30T16:00:00Z',
      approvedBy: 'staff1',
      staffNotes: 'Approved with standard pricing'
    },
    {
      _id: '3',
      quotationNumber: 'QUO-20241201-1236',
      customerName: 'Bob Johnson',
      customerEmail: 'bob@example.com',
      customerPhone: '+1 234 567 8902',
      items: [
        { productName: 'Gucci Frames', quantity: 1, unitPrice: 300, totalPrice: 300 },
        { productName: 'Progressive Lenses', quantity: 1, unitPrice: 150, totalPrice: 150 },
      ],
      subtotal: 450,
      tax: 45,
      discount: 0,
      totalAmount: 495,
      status: 'converted',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer approved and converted to order',
      prescriptionFile: 'prescription_1236.pdf',
      createdAt: '2024-11-29T09:20:00Z',
      approvedAt: '2024-11-29T10:00:00Z',
      approvedBy: 'staff1',
      customerApprovedAt: '2024-11-29T14:00:00Z',
      convertedAt: '2024-11-29T15:00:00Z',
      convertedToOrder: 'ORD-20241129-0001'
    },
    {
      _id: '4',
      quotationNumber: 'QUO-20241201-1237',
      customerName: 'Alice Brown',
      customerEmail: 'alice@example.com',
      customerPhone: '+1 234 567 8903',
      items: [
        { productName: 'Prada Sunglasses', quantity: 1, unitPrice: 400, totalPrice: 400 },
      ],
      subtotal: 400,
      tax: 40,
      discount: 0,
      totalAmount: 440,
      status: 'rejected',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer found the price too high',
      prescriptionFile: null,
      createdAt: '2024-11-28T14:30:00Z',
      rejectedAt: '2024-11-28T15:00:00Z',
      rejectedBy: 'staff1',
      rejectedReason: 'Price exceeds customer budget',
      customerRejectedAt: '2024-11-28T16:00:00Z',
      customerRejectionReason: 'Too expensive'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      case 'converted':
        return DollarSign;
      case 'expired':
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

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quotation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || quotation.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = () => {
    // Implement approval logic
    console.log('Approving quotation:', selectedQuotation?._id, staffNotes);
    setIsApproveDialogOpen(false);
    setStaffNotes('');
  };

  const handleReject = () => {
    // Implement rejection logic
    console.log('Rejecting quotation:', selectedQuotation?._id, rejectionReason, staffNotes);
    setIsRejectDialogOpen(false);
    setRejectionReason('');
    setStaffNotes('');
  };

  const handleReply = () => {
    // Implement reply logic
    console.log('Replying to quotation:', selectedQuotation?._id, replyMessage);
    setIsReplyDialogOpen(false);
    setReplyMessage('');
  };

  const handleConvert = () => {
    // Implement conversion logic
    console.log('Converting quotation to order:', selectedQuotation?._id);
    setIsConvertDialogOpen(false);
  };

  const handleViewDetails = (quotation: any) => {
    setSelectedQuotation(quotation);
  };

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
                Pending: {quotations.filter(q => q.status === 'pending').length}
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
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
                              {quotation.status === 'pending' && (
                                <>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedQuotation(quotation);
                                    setIsApproveDialogOpen(true);
                                  }}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedQuotation(quotation);
                                    setIsRejectDialogOpen(true);
                                  }}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              {quotation.status === 'approved' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedQuotation(quotation);
                                  setIsConvertDialogOpen(true);
                                }}>
                                  <DollarSign className="mr-2 h-4 w-4" />
                                  Convert to Order
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => {
                                setSelectedQuotation(quotation);
                                setIsReplyDialogOpen(true);
                              }}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Reply
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
            </CardContent>
          </Card>

          {/* Approve Dialog */}
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Quotation</DialogTitle>
                <DialogDescription>
                  Approve quotation {selectedQuotation?.quotationNumber} for {selectedQuotation?.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Staff Notes (Optional)</label>
                  <Textarea
                    placeholder="Add any notes about this approval..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApprove}>
                  Approve Quotation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Quotation</DialogTitle>
                <DialogDescription>
                  Reject quotation {selectedQuotation?.quotationNumber} for {selectedQuotation?.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Rejection Reason *</label>
                  <Textarea
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Staff Notes (Optional)</label>
                  <Textarea
                    placeholder="Add any additional notes..."
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
                  Reject Quotation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reply Dialog */}
          <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reply to Customer</DialogTitle>
                <DialogDescription>
                  Send a message to {selectedQuotation?.customerName} about quotation {selectedQuotation?.quotationNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Type your message to the customer..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="mt-1"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReply} disabled={!replyMessage}>
                  Send Reply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Convert Dialog */}
          <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert to Order</DialogTitle>
                <DialogDescription>
                  Convert quotation {selectedQuotation?.quotationNumber} to an order for {selectedQuotation?.customerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Order Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div>Subtotal: ${selectedQuotation?.subtotal?.toFixed(2)}</div>
                    <div>Tax: ${selectedQuotation?.tax?.toFixed(2)}</div>
                    <div>Discount: ${selectedQuotation?.discount?.toFixed(2)}</div>
                    <div className="font-medium">Total: ${selectedQuotation?.totalAmount?.toFixed(2)}</div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  This will create a new order and update product inventory.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConvert}>
                  Convert to Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </RoleGuard>
    </AdminLayout>
  );
}

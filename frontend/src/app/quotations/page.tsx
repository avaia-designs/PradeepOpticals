'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  FileText,
  Upload,
  Plus,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
} from 'lucide-react';
import { useUserStore } from '@/stores/user-store';
import { RoleGuard } from '@/components/auth/role-guard';
import { Permission } from '@/lib/permissions';

export default function QuotationsPage() {
  const { user } = useUserStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [quotationItems, setQuotationItems] = useState([
    { id: 1, productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  // Mock data - replace with actual API calls
  const quotations = [
    {
      _id: '1',
      quotationNumber: 'QUO-20241201-1234',
      items: [
        { productName: 'Ray-Ban Aviator', quantity: 1, unitPrice: 150, totalPrice: 150 },
        { productName: 'Custom Lenses', quantity: 1, unitPrice: 100, totalPrice: 100 },
      ],
      totalAmount: 250,
      status: 'pending',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer needs prescription lenses for reading',
      createdAt: '2024-12-01T10:30:00Z',
    },
    {
      _id: '2',
      quotationNumber: 'QUO-20241201-1235',
      items: [
        { productName: 'Oakley Sunglasses', quantity: 2, unitPrice: 120, totalPrice: 240 },
      ],
      totalAmount: 240,
      status: 'approved',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer approved the quotation',
      createdAt: '2024-11-30T15:45:00Z',
    },
    {
      _id: '3',
      quotationNumber: 'QUO-20241201-1236',
      items: [
        { productName: 'Gucci Frames', quantity: 1, unitPrice: 300, totalPrice: 300 },
        { productName: 'Progressive Lenses', quantity: 1, unitPrice: 150, totalPrice: 150 },
      ],
      totalAmount: 450,
      status: 'rejected',
      validUntil: '2024-12-31T23:59:59Z',
      notes: 'Customer found the price too high',
      createdAt: '2024-11-29T09:20:00Z',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'converted':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const addQuotationItem = () => {
    setQuotationItems([
      ...quotationItems,
      {
        id: quotationItems.length + 1,
        productName: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0
      }
    ]);
  };

  const removeQuotationItem = (id: number) => {
    setQuotationItems(quotationItems.filter(item => item.id !== id));
  };

  const updateQuotationItem = (id: number, field: string, value: any) => {
    setQuotationItems(quotationItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return quotationItems.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
    }
  };

  const handleSubmitQuotation = () => {
    // Implement quotation submission logic
    console.log('Submitting quotation:', {
      items: quotationItems,
      prescriptionFile,
      notes,
      total: calculateTotal()
    });
    setIsCreateDialogOpen(false);
    // Reset form
    setQuotationItems([{ id: 1, productName: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]);
    setPrescriptionFile(null);
    setNotes('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
              <p className="text-gray-600">Request custom quotations for your eyewear needs.</p>
            </div>
            <RoleGuard permission={Permission.REQUEST_QUOTATION}>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Request Quotation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Request Custom Quotation</DialogTitle>
                    <DialogDescription>
                      Get a personalized quote for your eyewear needs. Our staff will review your request and provide pricing.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    {/* Quotation Items */}
                    <div>
                      <Label className="text-base font-medium">Items</Label>
                      <div className="space-y-4 mt-2">
                        {quotationItems.map((item) => (
                          <div key={item.id} className="flex gap-4 items-end">
                            <div className="flex-1">
                              <Label>Product Name</Label>
                              <Input
                                placeholder="e.g., Ray-Ban Aviator"
                                value={item.productName}
                                onChange={(e) => updateQuotationItem(item.id, 'productName', e.target.value)}
                              />
                            </div>
                            <div className="w-24">
                              <Label>Quantity</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateQuotationItem(item.id, 'quantity', parseInt(e.target.value))}
                              />
                            </div>
                            <div className="w-32">
                              <Label>Unit Price</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateQuotationItem(item.id, 'unitPrice', parseFloat(e.target.value))}
                              />
                            </div>
                            <div className="w-32">
                              <Label>Total</Label>
                              <Input
                                value={item.totalPrice}
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeQuotationItem(item.id)}
                              disabled={quotationItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={addQuotationItem}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    {/* Prescription Upload */}
                    <div>
                      <Label className="text-base font-medium">Prescription (Optional)</Label>
                      <div className="mt-2">
                        <div className="flex items-center gap-4">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="flex-1"
                          />
                          {prescriptionFile && (
                            <Badge variant="secondary">
                              <FileText className="h-3 w-3 mr-1" />
                              {prescriptionFile.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Upload your prescription for accurate lens pricing (PDF, JPG, PNG)
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label className="text-base font-medium">Additional Notes</Label>
                      <Textarea
                        placeholder="Any specific requirements or questions..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-2"
                      />
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Total Estimated Cost:</span>
                        <span className="text-2xl font-bold text-primary">
                          <DollarSign className="h-5 w-5 inline mr-1" />
                          {calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitQuotation}>
                      Submit Quotation Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </RoleGuard>
          </div>

          {/* Quotations List */}
          <div className="grid gap-6">
            {quotations.map((quotation) => (
              <Card key={quotation._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{quotation.quotationNumber}</CardTitle>
                      <p className="text-sm text-gray-500">
                        Created on {formatDate(quotation.createdAt)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(quotation.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(quotation.status)}
                        {quotation.status}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items */}
                    <div>
                      <h4 className="font-medium mb-2">Items</h4>
                      <div className="space-y-2">
                        {quotation.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b">
                            <span>{item.productName} x{item.quantity}</span>
                            <span className="font-medium">
                              <DollarSign className="h-3 w-3 inline mr-1" />
                              {item.totalPrice}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-primary">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        {quotation.totalAmount}
                      </span>
                    </div>

                    {/* Notes */}
                    {quotation.notes && (
                      <div>
                        <h4 className="font-medium mb-1">Notes</h4>
                        <p className="text-sm text-gray-600">{quotation.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {quotation.status === 'approved' && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Convert to Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
  );
}

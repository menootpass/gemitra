# Booking System Update - JSON Pricing Integration

## Overview
Updated the Gemitra booking system to store detailed pricing information in JSON format and display comprehensive invoice breakdowns.

## Changes Made

### 1. Transaction API Updates (`app/api/transactions/route.ts`)
- **Added cart data support**: Now accepts `cart` parameter with detailed destination information
- **JSON pricing generation**: Creates `rincian_destinasi` as JSON object with slug:harga pairs
- **Enhanced data structure**: Includes all required fields for Google Sheets integration
- **Unique transaction codes**: Generates timestamp-based codes (TRXYYYYMMDDHHMMSS)

### 2. New Transaction Fetch API (`app/api/transactions/[kode]/route.ts`)
- **Dedicated endpoint**: `/api/transactions/[kode]` for fetching transaction data
- **Google Sheets integration**: Connects to existing Google Apps Script
- **Error handling**: Comprehensive error handling and logging

### 3. SidebarCart Component Updates (`app/components/SidebarCart.tsx`)
- **Cart data inclusion**: Sends detailed cart information to transaction API
- **Enhanced transaction data**: Includes slug and pricing for each destination

### 4. Invoice Page Enhancements (`app/invoice/[kode]/page.tsx`)
- **API route integration**: Uses new `/api/transactions/[kode]` endpoint
- **JSON pricing parser**: Handles both new JSON format and legacy format
- **Detailed pricing display**: Shows individual destination pricing with passenger calculations
- **Enhanced WhatsApp message**: Includes detailed pricing breakdown

## Data Structure

### Transaction Data Format
```json
{
  "nama": "Customer Name",
  "destinasi": "Destination Names",
  "destinasi_harga": [55000, 15000],
  "penumpang": 2,
  "tanggal_berangkat": "2024-12-25",
  "waktu_berangkat": "08:00",
  "kendaraan": "Brio",
  "kendaraan_harga": 747500,
  "total": 817500,
  "rincian_destinasi": "{\"museum-ullen-sentalu\": \"55000\", \"desa-wisata-wukirsari\": \"15000\"}",
  "rincian_mobil": 747500,
  "status": "pending",
  "kode": "TRX20241225080000",
  "waktu_transaksi": "2024-12-25T08:00:00.000Z",
  "tanggal_transaksi": "2024-12-25"
}
```

### Google Sheets Columns
- `nama` - Customer name
- `destinasi` - Destination names (comma-separated)
- `penumpang` - Number of passengers
- `tanggal_berangkat` - Departure date
- `waktu_berangkat` - Departure time
- `kendaraan` - Vehicle type
- `total` - Total amount
- `status` - Transaction status
- `kode` - Transaction code
- `waktu_transaksi` - Transaction timestamp
- `tanggal_transaksi` - Transaction date
- `rincian_destinasi` - JSON string with destination pricing
- `rincian_mobil` - Vehicle price (integer)

## Features

### 1. Detailed Pricing Breakdown
- Individual destination pricing per passenger
- Vehicle pricing separate from destinations
- Transparent calculation display
- Passenger count multiplication

### 2. Enhanced Invoice Display
- Itemized destination costs
- Vehicle rental costs
- Subtotal calculations
- Total amount verification

### 3. WhatsApp Integration
- Detailed pricing in WhatsApp message
- Individual destination costs
- Total calculation breakdown
- Professional formatting

### 4. Backward Compatibility
- Supports both JSON and legacy pricing formats
- Graceful fallback for old data
- Maintains existing functionality

## Testing

### Test Script
Run `node test-booking-flow.js` to test the complete booking flow:
1. Creates a test transaction
2. Fetches transaction data
3. Verifies JSON pricing structure
4. Tests invoice generation

### Manual Testing
1. Add destinations to cart
2. Select vehicle and passenger count
3. Fill booking details
4. Submit booking
5. Verify invoice displays correct pricing
6. Test WhatsApp message formatting

## Google Sheets Integration

The system sends data to Google Sheets with the following structure:
- **Action**: `createTransaction`
- **Data**: Complete transaction object with JSON pricing
- **Response**: Success status and transaction code

## Error Handling

- **Validation**: Required field validation before API calls
- **Fallback**: Graceful handling of missing or invalid data
- **Logging**: Comprehensive console logging for debugging
- **User feedback**: Clear error messages for users

## Future Enhancements

1. **Real-time pricing updates**: Dynamic pricing from Google Sheets
2. **Payment integration**: Direct payment processing
4. **Email notifications**: Automated email confirmations
5. **Admin dashboard**: Transaction management interface

## Dependencies

- Next.js 14+ (API Routes)
- Google Apps Script (Data storage)
- SWR (Data fetching)
- React (UI components)

## Environment Variables

Ensure these are set:
- `NEXT_PUBLIC_GEMITRA_APP_SCRIPT_URL` - Google Apps Script URL

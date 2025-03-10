"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
// import { ChevronDown } from "lucide-react";
import { TrophySpin } from "react-loading-indicators";
import { Button } from "@/components/ui/button";

// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTokenBalances } from "./server_actions/hook";
import { useSession } from "next-auth/react";
import { TokenQuote } from "./server_actions/TokenBalances";
import { ChatBot } from "../_components/chatbot";
import { PortfolioChart } from "./_components/chart";
import Image from "next/image";

export type Payment = {
  logo: string | undefined;
  name: string;
  address: string | undefined;
  symbol: string | undefined;
  balance: number;
  positive: boolean;
  id: number | undefined;
  quote: TokenQuote | undefined;
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => row.index + 1, // Numbering starts from 1
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left text-xs">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-start space-x-2">
        <Image
          src={row.original.logo ?? ""}
          width={30}
          height={30}
          alt={row.original.name}
        />
        <div className="capitalize text-xs">
          <span className="text-sm font-semibold">
            {row.original.quote?.symbol}
          </span>{" "}
          <span className="text-gray-600">{row.original.quote?.name}</span>
        </div>
      </div>
    ),
  },

  {
    accessorKey: "id",
    header: () => <div className="text-left text-xs">Price</div>,
    cell: ({ row }) => (
      <div className="capitalize font-medium">
        <span
          className={`${
            (row.original.quote?.quote.USD.percent_change_24h ?? 0) >= 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {Number(row.original.quote?.quote.USD.price.toFixed(4) ?? 0)}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "balance",
    header: () => <div className="text-left text-xs">Amount</div>,
    cell: ({ row }) => {
      return (
        <div className="text-left font-medium">
          {Number(row.original.balance.toFixed(4))} {row.original.symbol}
        </div>
      );
    },
  },
  {
    accessorKey: "symbol",
    header: () => <div className="text-right text-xs">Current value</div>,
    cell: ({ row }) => {
      const change = row.original.quote?.quote.USD.percent_change_24h ?? 0;
      const textColor = change >= 0 ? "text-green-500" : "text-red-500";
      return (
        <div className={`text-right text-lg font-medium ${textColor}`}>
          $
          {Number(
            (
              Number(row.original.balance.toFixed(4)) *
              Number(row.original.quote?.quote.USD.price.toFixed(4) ?? 0)
            ).toFixed(2)
          )}{" "}
        </div>
      );
    },
  },
  {
    accessorKey: "logo",
    header: () => <div className="text-right text-xs">Day&apos;s P&L</div>,
    cell: ({ row }) => {
      const valuechange = row.original.quote?.quote.USD.percent_change_24h ?? 0;

      const currentValue =
        row.original.balance * (row.original.quote?.quote.USD.price ?? 0);

      const val = Number(
        (currentValue - currentValue / (1 + valuechange / 100)).toFixed(4)
      );
      return (
        <div
          className={`text-right font-medium ${
            val > 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          ${val}{" "}
        </div>
      );
    },
  },
  {
    accessorKey: "quote",
    header: () => <div className="text-right text-xs">Last 7 Days</div>,
    cell: ({ row }) => {
      const price = Number(
        row.original.quote?.quote.USD.percent_change_7d.toFixed(4)
      );

      return (
        <div className="capitalize text-right flex justify-end">
          <Image
            src={`https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/${row.original.id}.svg`}
            width={100}
            style={{
              filter:
                price > 0
                  ? "invert(50%) sepia(100%) saturate(500%) hue-rotate(90deg)"
                  : "hue-rotate(300deg) saturate(210%) brightness(0.7) contrast(170%)",
            }}
            alt={row.original.name}
          />
        </div>
      );
    },
  },
];

export default function DataTableDemo() {
  const session = useSession();

  const { data: tokens, isLoading } = useTokenBalances(
    (session.data?.user.wallet ?? "")?.toString()
  );

  const [data, setData] = React.useState<Payment[]>(tokens ?? []);

  console.log(tokens);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  React.useEffect(() => {
    if (tokens)
      if (tokens?.length !== data.length) {
        setData(tokens);
      }
  }, [tokens, data.length]);
  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (!session.data?.user.wallet) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Please sign in to continue
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <TrophySpin size="medium" color="#3b82f6" />
      </div>
    );
  }

  return (
    <div className="w-full py-20 p-10">
      <div className="mb-6">
        <PortfolioChart tokens={tokens} />
      </div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by token name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {data.length} tokens
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      <ChatBot />
    </div>
  );
}

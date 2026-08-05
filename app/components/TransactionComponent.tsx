import { Transaction } from '@/type'
import React from 'react'
import ProductImage from './ProductImage'

const TransactionComponent = ({ tx }: { tx: Transaction }) => {

    const formattedDate = new Date(tx.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    return (
        <div className='p-4 border-2 border-base-200 rounded-3xl flex items-center w-full'>
            <div>
                {tx.imageUrl && (
                    <ProductImage
                        src={tx.imageUrl}
                        alt={tx.imageUrl}
                        heightClass='h-12'
                        widthClass='w-12'
                    />
                )}
            </div>
            <div className='ml-4 flex justify-between w-full items-center gap-4'>
                <div className='min-w-0'>
                    <p className='font-semibold'>{tx.productName}</p>
                    <div className='badge badge-soft badge-warning mt-2'>{tx.categoryName}</div>
                    {tx.type === "OUT" && (tx.beneficiary || tx.reason) && (
                        <div className='mt-2 text-xs opacity-80 space-y-0.5'>
                            {tx.beneficiary && <p>Bénéficiaire : <span className='font-medium'>{tx.beneficiary}</span></p>}
                            {tx.reason && <p>Motif : <span className='font-medium'>{tx.reason}</span></p>}
                        </div>
                    )}
                </div>
                <div className='flex flex-cend flex-col shrink-0'>
                    <div className='text-right'>
                        <div>
                            {tx.type == "IN" ? (
                                <div>
                                    <span className='text-success font-bold text-xl capitalize'>
                                        +{tx.quantity} {tx.unit}
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    <span className='text-error font-bold text-xl capitalize'>
                                        -{tx.quantity} {tx.unit}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className='text-xs'>
                            {formattedDate}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransactionComponent

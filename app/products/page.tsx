"use client"
import React, { useEffect, useMemo, useState } from 'react'
import Wrapper from '../components/Wrapper'
import { useUser } from '@clerk/nextjs'
import { Product } from '@/type'
import { deleteProduct, getAssociation, readCategories, readProducts } from '../actions'
import EmptyState from '../components/EmptyState'
import ProductImage from '../components/ProductImage'
import Link from 'next/link'
import { Download, FileSpreadsheet, RotateCcw, Search, Trash } from 'lucide-react'
import { toast } from 'react-toastify'
import { Category } from '@prisma/client'
import { exportProductsCsv, exportProductsPdf } from '@/lib/export'
import { formatMoney } from '@/lib/format'

type StockFilter = "all" | "ok" | "low" | "out"

const page = () => {
    const { user } = useUser()
    const email = user?.primaryEmailAddress?.emailAddress as string
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [search, setSearch] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [stockFilter, setStockFilter] = useState<StockFilter>("all")
    const [currency, setCurrency] = useState("EUR")
    const [assocName, setAssocName] = useState("MarketStock")

    const fetchProducts = async () => {
        try {
            if (email) {
                const [productsData, categoriesData, assoc] = await Promise.all([
                    readProducts(email),
                    readCategories(email),
                    getAssociation(email),
                ])
                if (productsData) setProducts(productsData)
                if (categoriesData) setCategories(categoriesData)
                if (assoc) {
                    setCurrency(assoc.currency || "EUR")
                    setAssocName(assoc.name || "MarketStock")
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (email)
            fetchProducts()
    }, [email])

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase()
        return products.filter((product) => {
            const matchesSearch =
                !query ||
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.categoryName.toLowerCase().includes(query)

            const matchesCategory = !categoryId || product.categoryId === categoryId

            const matchesStock =
                stockFilter === "all" ||
                (stockFilter === "ok" && product.quantity > product.minQuantity) ||
                (stockFilter === "low" && product.quantity > 0 && product.quantity <= product.minQuantity) ||
                (stockFilter === "out" && product.quantity === 0)

            return matchesSearch && matchesCategory && matchesStock
        })
    }, [products, search, categoryId, stockFilter])

    const handleDeleteProduct = async (product: Product) => {
        const confirmDelete = confirm("Voulez-vous vraiment supprimer ce produit ?")
        if (!confirmDelete) return;
        try {
            if (product.imageUrl) {
                const resDelete = await fetch("/api/upload", {
                    method: "DELETE",
                    body: JSON.stringify({ path: product.imageUrl }),
                    headers: { 'Content-Type': 'application/json' }
                })
                const dataDelete = await resDelete.json()
                if (!dataDelete.success) {
                    throw new Error("Erreur lors de la suppression de l’image.")
                } else {
                    if (email) {
                        await deleteProduct(product.id, email)
                        await fetchProducts()
                        toast.success("Produit supprimé avec succès ")
                    }
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const getStockBadge = (product: Product) => {
        if (product.quantity === 0) {
            return <span className="badge badge-error badge-sm">Rupture</span>
        }
        if (product.quantity <= product.minQuantity) {
            return <span className="badge badge-warning badge-sm">Faible</span>
        }
        return <span className="badge badge-success badge-sm">OK</span>
    }

    const resetFilters = () => {
        setSearch("")
        setCategoryId("")
        setStockFilter("all")
    }

    return (
        <Wrapper>
            <div className='flex flex-col gap-4 mb-4 md:flex-row md:items-center md:flex-wrap'>
                <label className='input input-bordered flex items-center gap-2 w-full md:max-w-xs'>
                    <Search className='w-4 h-4 opacity-60' />
                    <input
                        type="text"
                        className="grow"
                        placeholder="Rechercher un produit..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </label>

                <select
                    className='select select-bordered w-full md:w-48'
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                <select
                    className='select select-bordered w-full md:w-48'
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                >
                    <option value="all">Tous les stocks</option>
                    <option value="ok">Stock normal</option>
                    <option value="low">Stock faible</option>
                    <option value="out">Rupture</option>
                </select>

                <button className='btn btn-ghost btn-sm' onClick={resetFilters}>
                    <RotateCcw className='w-4 h-4' />
                    Réinitialiser
                </button>

                <div className='flex gap-2 md:ml-auto'>
                    <button
                        className='btn btn-sm btn-outline'
                        disabled={filteredProducts.length === 0}
                        onClick={() => exportProductsCsv(filteredProducts, currency)}
                    >
                        <FileSpreadsheet className='w-4 h-4' />
                        CSV
                    </button>
                    <button
                        className='btn btn-sm btn-primary'
                        disabled={filteredProducts.length === 0}
                        onClick={() =>
                            exportProductsPdf(filteredProducts, {
                                title: `Inventaire — ${assocName}`,
                                currency,
                            })
                        }
                    >
                        <Download className='w-4 h-4' />
                        PDF
                    </button>
                </div>
            </div>

            <div className='overflow-x-auto'>
                {products.length === 0 ? (
                    <div>
                        <EmptyState
                            message='Aucun produit disponible'
                            IconComponent='PackageSearch'
                        />
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <EmptyState
                        message='Aucun produit ne correspond aux filtres'
                        IconComponent='PackageSearch'
                    />
                ) : (
                    <table className='table'>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Image</th>
                                <th>Nom</th>
                                <th>Description</th>
                                <th>Prix</th>
                                <th>Quantité</th>
                                <th>Seuil</th>
                                <th>Statut</th>
                                <th>Catégorie</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, index) => (
                                <tr key={product.id}>
                                    <th>{index + 1}</th>
                                    <td>
                                        <ProductImage
                                            src={product.imageUrl}
                                            alt={product.imageUrl}
                                            heightClass='h-12'
                                            widthClass='w-12'
                                        />
                                    </td>
                                    <td>
                                        {product.name}
                                    </td>
                                    <td>
                                        {product.description}
                                    </td>
                                    <td>
                                        {formatMoney(product.price, currency)}
                                    </td>
                                    <td className='capitalize'>
                                        {product.quantity} {product.unit}
                                    </td>
                                    <td>
                                        {product.minQuantity}
                                    </td>
                                    <td>
                                        {getStockBadge(product)}
                                    </td>
                                    <td>
                                        {product.categoryName}
                                    </td>
                                    <td className='flex gap-2 flex-col'>
                                        <Link className='btn btn-xs w-fit btn-primary' href={`/update-product/${product.id}`}>
                                            Modifier
                                        </Link>
                                        <button className='btn btn-xs w-fit' onClick={() => handleDeleteProduct(product)}>
                                            <Trash className='w-4 h-4' />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Wrapper>
    )
}

export default page

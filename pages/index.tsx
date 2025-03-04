import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import FormContainer from '@/container/FormContainer'
import { getToken } from 'next-auth/jwt'
import { useRef, useState } from 'react'

import { signOut, useSession } from 'next-auth/react'
import useSWR from 'swr'
import { GetServerSidePropsContext } from 'next'

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json())

export default function Home() {
  const session = useSession()
  const popoverRef = useRef<HTMLButtonElement | null>(null)
  const [valueEdit, setValueEdit] = useState<{
    id: number
    title: string
    url: string
  }>({
    id: 0,
    title: '',
    url: '',
  })
  const [showEdit, setShowEdit] = useState<boolean>(false)
  const [showCreate, setShowCreate] = useState<boolean>(false)
  const { data: dataLinks, isLoading, mutate } = useSWR('/api/links', fetcher)

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/links/delete/${id}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.log('🚀 ~ handleDelete ~ error:', error)
    } finally {
      popoverRef.current?.click()
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4">
        <div className="container">
          <h1 className="text-xl font-bold">
            {`Hello, ${session.data?.user?.email}`}
          </h1>
          <p>This is an area to create yout links, lets put here!</p>
          <Button variant={'link'} size={'sm'} onClick={() => signOut()}>
            SignOut
          </Button>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)}>Add Links</Button>
        </div>

        {isLoading && <p>Loading...</p>}
        {dataLinks?.data.map(
          (link: { id: number; url: string; title: string }) => (
            <Card key={link.id}>
              <CardContent className="flex justify-between">
                <a href={link.url} target="_blank">
                  {link.title}
                </a>
                <div className="flex justify-between gap-4">
                  <Button
                    size={'sm'}
                    variant={'secondary'}
                    onClick={() => {
                      setValueEdit({
                        id: link.id,
                        title: link.title,
                        url: link.url,
                      })
                      setShowEdit(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        ref={popoverRef}
                        variant={'destructive'}
                        size={'sm'}
                      >
                        Delete
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <p>Are you sure for delete this data ?</p>
                      <Button size={'sm'} onClick={() => handleDelete(link.id)}>
                        Yes
                      </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      {/* Drawer Create */}
      <Drawer open={showCreate} onOpenChange={setShowCreate}>
        <DrawerContent>
          <div className="container mx-auto p-4">
            <FormContainer
              onFinished={() => {
                setShowCreate(false)
                mutate()
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Drawer Edit */}
      <Drawer open={showEdit} onOpenChange={setShowEdit}>
        <DrawerContent>
          <div className="container mx-auto p-4">
            <FormContainer
              id={valueEdit.id}
              values={{
                title: valueEdit.title,
                url: valueEdit.url,
              }}
              onFinished={() => {
                setShowEdit(false)
                mutate()
              }}
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const token = await getToken({
    req: context.req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  return { props: {} }
}

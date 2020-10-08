import Axios from 'axios'
import React, { useState } from 'react'
import styled from 'styled-components'

import { CatchInputsData } from '../../utils/catchInputsData'
import showErrorFunction from '../../utils/showErrorMsg'

const Modal = styled.div`
        width: 100vw;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 1;
        form{
            display: flex;
            flex-direction: column;
        }
        label{
            color: white;
        }
`

const Circle = styled.div`
        position:fixed;
        bottom: 20px;
        right: 10px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #00FFFF;
        font-size: 27px;
        font-weight: bold;
        text-align: center;
        cursor: pointer;
        z-index: 1;
        &.logoff{
            font-size: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            bottom: 65px;
        }
`

export default props => {
    const [visible, setVisible] = useState(false)

    const createProduct = async e => {
        e.preventDefault()
        const button = document.querySelector('#submit')

        button.disable = true

        const data = CatchInputsData(e)

        const dataArray = []

        for (const property in data) {
            data[property] === undefined && delete data[property]

            if (property !== 'price') {
                dataArray.push(`${property}: "${data[property]}"`)
            } else {
                dataArray.push(`${property}: ${data[property]}`)
            }
        }
        
        try{
            const res = await Axios.post(process.env.REACT_APP_API || 'http://localhost:8081/graphql', {
                query: `
                    mutation{
                        createProduct(token:"${window.localStorage.getItem('authorization')}" data:{${dataArray.map(e => e)}})
                    }
                    `
            })
            if(res.data.data.createProduct) {
                showErrorFunction('Produto criado com sucesso', 'success')
                setVisible(false)
                props.setCreated(true)
            }
        } catch (e) {
            button.disable = false
            return showErrorFunction(e.response.data.errors[0].message, 'error')
        }
    }

    return (
        <>
            <Circle onClick={() => setVisible(true)}>+</Circle>
            <Circle className='logoff' onClick={() => {window.localStorage.removeItem('authorization'); props.setAdmin(false)}}>Sair</Circle>
            {visible &&
                <Modal id='modal' onClick={e => e.target.id === 'modal' && setVisible(false) }>
                    <form onSubmit={e => createProduct(e)}>
                        <label htmlFor="fotourl">URL da foto:</label>
                        <input type="text" name="fotourl" id="fotourl" required placeholder='EX: http://link.png .jpg ...' />
                        <label htmlFor="name">Nome:</label>
                        <input type="text" name="name" required id="name" />
                        <label htmlFor="price">Preço:</label>
                        <input type="number" name="price" id="price" required step='any' placeholder='EX: 40.00 (sem R$ e , )' />
                        <label htmlFor="size">Tamanho:</label>
                        <input type="text" name="size" required id="size" placeholder='M/GG' />
                        <label htmlFor="description">Descrição do produto:</label>
                        <input type="text" name="description" id="description" />
                        <label htmlFor="category">Categoria:</label>
                        <input type="text" name="category" required id="category" /><br />
                        <button type="submit" id='submit'>Cadastrar produto</button>
                    </form>
                </Modal>
            }
        </>
    )
}
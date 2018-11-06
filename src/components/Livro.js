import React, { Component } from 'react';
import $ from 'jquery';
import InputCustomizado from './InputCustomizado.js';
import SubmitCustomizado from './SubmitCustomizado.js';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros.js'

class FormularioLivro extends Component {
    constructor() {
        super();
        this.state =
            {
                titulo: '',
                preco: '',
                autorId: ''
            };
    }
    setTitulo = (e) => {
        this.setState({
            titulo: e.target.value
        })
    }

    setPreco = (e) => {
        this.setState({
            preco: e.target.value
        })
    }

    setAutorId = (e) => {
        this.setState({
            autorId: e.target.value
        })
    }
    enviaForm = (e) => {
        e.preventDefault();
        $.ajax({
            url: 'https://cdc-react.herokuapp.com/api/livros',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({ titulo: this.state.titulo, preco: this.state.preco, autorId: this.state.autorId }),
            success: (novaListagem) => {
                console.log('sucessooo');
                PubSub.publish('atualiza-listagem-livros', novaListagem);
                this.setState({
                    titulo: '',
                    preco: '',
                    autorId: ''
                })
            },
            error: (res) => {
                console.log('falhô');
                if (res.status === 400) {
                    new TratadorErros().publicaErros(res.responseJSON);
                }
            },
            beforeSend: () => {
                PubSub.publish('limpa-erros', {});
            }
        })
    }
    render() {
        return(
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">
                    <InputCustomizado id="titulo" type="text" name="titulo" value={this.state.titulo} label="Título" onChange={this.setTitulo} />
                    <InputCustomizado id="preco" type="text" name="preco" value={this.state.preco} label="Preço" onChange={this.setPreco} />
                    <div className="pure-control-group">
                        <label htmlFor="autorId">Autor</label> 
                            <select name="autorId" id="autorId" onChange={this.setAutorId} value={this.state.autorId}>
                            <option value="">Selecione o valor</option>
                            {
                                this.props.autores.map(autor => {
                                    return (
                                        <option value={autor.id}>{autor.nome}</option>
                                    )
                                })
                            }
                        </select>
                        </div>
                    <SubmitCustomizado label="Gravar" />
                </form>
            </div> 
        )

    }
}

class TabelaLivros extends Component {
    render() {
        return (
            <div>
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Título</th>
                            <th>Preco</th>
                            <th>Autor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.props.lista.map(x => {
                                return (
                                    <tr key={x.id}>
                                        <td>{x.titulo}</td>
                                        <td>{x.preco}</td>
                                        <td>{x.autor.nome}</td>
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default class LivroBox extends Component {
    constructor() {
        super();
        this.state = {
            lista: [],
            autores: []
        }
    }

    componentDidMount() {
        $.ajax({
            url: "https://cdc-react.herokuapp.com/api/autores",
            dataType: 'json',
            success: (res) => {
                this.setState({
                    autores: res
                })
            }
        })

        $.ajax({
            url: "https://cdc-react.herokuapp.com/api/livros",
            dataType: 'json',
            success: (res) => {
                this.setState({
                    lista: res
                })
            }
        })

        PubSub.subscribe('atualiza-listagem-livros', (topico, novaListagem) => {
            this.setState({
                lista: novaListagem
            })
        });
    }
    render() {
        return (
            <div>
                <div className="header">
                    <h1>Cadastro de Livros</h1>
                </div>
                <div className="content" id="content">
                    <FormularioLivro autores={this.state.autores} />
                    <TabelaLivros lista={this.state.lista} />
                </div>
            </div>
        );
    }
}

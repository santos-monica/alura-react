import React, {Component} from 'react';
import $ from 'jquery';
import InputCustomizado from './InputCustomizado.js';
import SubmitCustomizado from './SubmitCustomizado.js';
import PubSub from 'pubsub-js';
import TratadorErros from './TratadorErros.js'

class FormularioAutor extends Component {
    constructor() {
        super();
        this.state = 
        {
            nome: '',
            email: '',
            senha: ''
        };
    }
    enviaForm = (e) => {
        e.preventDefault();
        $.ajax({
            url:'https://cdc-react.herokuapp.com/api/autores',
            contentType: 'application/json',
            dataType: 'json',
            type: 'post',
            data: JSON.stringify({nome:this.state.nome, email:this.state.email, senha:this.state.senha}),
            success: (novaListagem) => {
                PubSub.publish('atualiza-listagem-autores', novaListagem);
                this.setState({
                    nome: '',
                    email: '',
                    senha: ''                })
            },
            error: (res) => {
                if (res.status === 400) {
                    new TratadorErros().publicaErros(res.responseJSON);
                }
            },
            beforeSend: () => {
                PubSub.publish('limpa-erros', {});
            }
        })
    }
    salvaAlteracao = (inputName, event) => {
        this.setState({ [inputName]: event.target.value })
    }    
    
    render() {
        return (
            <div className="pure-form pure-form-aligned">
                <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm.bind(this)} method="post">
                    <InputCustomizado id="nome" type="text" name="nome" value={this.state.nome} label="Nome" onChange={(e) => this.salvaAlteracao("nome", e)} />
                    <InputCustomizado id="email" type="email" name="email" value={this.state.email} label="Email" onChange={(e) => this.salvaAlteracao("email", e)} />
                    <InputCustomizado id="senha" type="password" name="senha" value={this.state.senha} label="Senha" onChange={(e) => this.salvaAlteracao("senha", e)} />
                <SubmitCustomizado label="Gravar"/>
                </form>             
            </div> 
            );
        }
}

class TabelaAutores extends Component {
    render() {
        return (
            <div>            
                <table className="pure-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>email</th>
                            </tr>
                    </thead>
                    <tbody>
                    {
                        this.props.lista.map(x => {
                            return (
                                <tr key={x.id}>
                                    <td>{x.nome}</td>
                                    <td>{x.email}</td>
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

export default class AutorBox extends Component {
    constructor() {
        super();
        this.state = { 
            lista: [],
        }
    }

    componentDidMount(){
        $.ajax({
            url: "https://cdc-react.herokuapp.com/api/autores",
            dataType: 'json',
            success: (res) => {
                this.setState({
                    lista: res
                })
            }
        })

        PubSub.subscribe('atualiza-listagem-autores', (topico, novaListagem) => {
            this.setState({
                lista: novaListagem
            })
        });
    }

    render() {
        return(
            <div>
                <div className="header">
                    <h1>Cadastro de Autores</h1>
                </div>
                <div className="content" id="content">
                    <FormularioAutor />
                    <TabelaAutores lista={this.state.lista}/>
                </div>
            </div>
        );
    }
}
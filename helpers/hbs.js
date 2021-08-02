module.exports = {
	checkEqual: function (value1, value2) {
		if (value1 === value2) {
			return true;
		} else {
			return false;
		}
	},
	randomNumber: function () {
		return Math.floor(Math.random() * 999);
	},
	setVar: function (varName, varIndex, varValue, options) {
		const newVarName = varName + varIndex;
		options.data.root[newVarName] = varValue;
	},
	getVar: function (varName, varIndex, options) {
		const newVarName = varName + varIndex;
		return options.data.root[newVarName];
	},
	isTen: function (value) {
		return !(value >= 10);
	},
	renderItems: function (arr, category) {
		let result = "";

		if (category === "otros") {
			arr = arr.filter((item) => {
				return item.category == "otros" || !item.category;
			});
		} else if (category != "all") {
			arr = arr.filter((item) => item.category === category);
		}

		arr.forEach((item) => {
			const newItem = `

				\n

                                <div class="item-card" data-item-id='${
									item._id
								}'>

                                    <div style="width: 100%">
                                        <img src="${
											item.image
										}" class="item-image" alt="Imagen">
                                    </div>

                                    <div class="info-modal">
                                            <div class="info-background"></div>
                                            <div class="info-container">
                                                    <span class="close-button">&#10006;</span>

                                                    <div class="info-grid">
                                                            <div>
                                                                    <img src="${
																		item.image
																	}" alt="Imagen">
                                                            </div>
                                                            <div>
                                                                    <h1><b>${
																		item.name
																	}</b></h1>

                                                                    <table>
                                                                            <tbody>
                                                                                    <tr>
                                                                                            <th>Medidas</th>
                                                                                            <th>Tipo</th>
                                                                                            <th>Precio</th>
                                                                                    </tr>
                                                                                    ${item.details.map(
																						(
																							detail
																						) => {
																							return `
                                                                                                <tr>
                                                                                                        <td>${detail.measurments}</td>
                                                                                                        <td>${detail.type}</td>
                                                                                                        <td>$${detail.price}</td>
                                                                                                </tr>
                                                                                            `;
																						}
																					)}
                                                                            </tbody>
                                                                    </table>
                                                            </div>
                                                    </div>
                                            </div>
                                    </div>


                                    <h1 class="item-name"><b>${
										item.name
									}</b></h1>

                                    <!-- <div class="info-button-container">
                                        <button class="info-button" id="${
											item._id
										}">
                                            <h3><b>Detalles</b><h3>
                                        </button>
                                    </div> -->
                                </div>

                                \n
                            `;

			result = result.concat(newItem);
		});

		return result;
	},
	renderAdminItems: function (arr, category) {
		let result = "";

		if (category === "otros") {
			arr = arr.filter((item) => {
				return item.category == "otros" || !item.category;
			});
		} else if (category != "all") {
			arr = arr.filter((item) => item.category === category);
		}

		arr.forEach((item) => {
			const newItem = `

                        \n

                        <form class="item-card" action="/admin/${
							item._id
						}" method="POST" data-item-id=${item._id}>
                        <input type="hidden" name="_method" value="DELETE">

                        <div style="width: 100%">
                            <img src="${
								item.image
							}" class="item-image" alt="servicio">
                        </div>

                                        <div class="info-modal">
                                                <div class="info-background"></div>
                                                <div class="info-container">
                                                        <span class="close-button">&#10006;</span>

                                                        <div class="info-grid">
                                                                <div>
                                                                        <img src="${
																			item.image
																		}" alt="Imagen">
                                                                </div>
                                                                <div>
                                                                        <h1><b>${
																			item.name
																		}</b></h1>

                                                                        <table>
                                                                                <tbody>
                                                                                        <tr>
                                                                                                <th>Medidas</th>
                                                                                                <th>Tipo</th>
                                                                                                <th>Precio</th>
                                                                                        </tr>
                                                                                        ${item.details.map(
																							(
																								detail
																							) => {
																								return `
                                                                                                    <tr>
                                                                                                            <td>${detail.measurments}</td>
                                                                                                            <td>${detail.type}</td>
                                                                                                            <td>$${detail.price}</td>
                                                                                                    </tr>
                                                                                                `;
																							}
																						)}
    
                                                                                </tbody>
                                                                        </table>
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>


                                        <h1 class="item-name"><b>${
											item.name
										}</b></h1>

                        <!-- <div style="margin-bottom: 20px;" class="info-button-container">
                            <button type="button" class="info-button" id=${
								item._id
							}>
                                <h3><b>Detalles</b><h3>
                            </button>
                        </div> -->

                        <a href="/admin/editar/${item._id}">
                                <button type="button" class="edit-button">
                                        <h3><b>Editar</b></h3>
                                </button>
                        </a>

                        <button class="delete-button" type="submit">
                                <h3><b>Borrar Articulo</b></h3>
                        </button>

    </form>

                        \n
                    `;

			result = result.concat(newItem);
		});

		return result;
	},
	renderEditCategories: function(category) {
	    let  result = `
		<select class="add-input" name="category">
		    <option value="otros" ${category === "otros" && 'selected'}>Otros</option>
		    <option value="camas" ${category === "camas" && 'selected'}>Camas</option>
		    <option value="buros" ${category === "buros" && 'selected'}>Buros</option>
		    <option value="comodas" ${category === "comodas" && 'selected'}>Comodas</option>
                    <option value="salas" ${category === "salas" && 'selected'}>Salas</option>
		    <option value="consolas" ${category === "consolas" && 'selected'}>Consolas</option>
		    <option value="mueblestv" ${category === "mueblestv" && 'selected'}>Muebles de TV</option>
		    <option value="comedores" ${category === "comedores" && 'selected'}>Comedores</option>
		    <option value="sillas" ${category === "sillas" && 'selected'}>Sillas</option>
		    <option value="libreros" ${category === "libreros" && 'selected'}>Libreros</option>
		    <option value="escritorios" ${category === "escritorios" && 'selected'}>Escritorios</option>
		    <option value="macrame" ${category === "macrame" && 'selected'}>Macrame</option>
		    <option value="lamparas" ${category === "lamparas" && 'selected'}>Lamparas</option>
		    <option value="deco" ${category === "deco" && 'selected'}>Decoración</option>
		</select>
	    `;

	    return result;
	}

};
